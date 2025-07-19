// razorpay.ts - Fixed receipt length issue
'use server';

import Razorpay from 'razorpay';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { add } from 'date-fns';
import crypto from 'crypto';

const OrderOptionsSchema = z.object({
  amount: z.number().positive().min(1),
  userId: z.string().min(1),
  plan: z.enum(['monthly', 'yearly']),
  user: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  })
});

type OrderOptions = z.infer<typeof OrderOptionsSchema>;

// Helper function to generate a short receipt ID (max 40 chars)
function generateReceiptId(userId: string): string {
  // Take first 8 characters of userId and add timestamp suffix
  const userIdPrefix = userId.substring(0, 8);
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const receipt = `rcpt_${userIdPrefix}_${timestamp}`;
  
  // Ensure it's within 40 character limit
  return receipt.length > 40 ? receipt.substring(0, 40) : receipt;
}

export async function createRazorpayOrder(options: OrderOptions) {
    console.log('=== RAZORPAY ORDER CREATION DEBUG ===');
    console.log('1. Raw options received:', {
        amount: options.amount,
        userId: options.userId?.substring(0, 8) + '...',
        plan: options.plan,
        user: {
            name: options.user?.name,
            email: options.user?.email,
            phone: options.user?.phone ? '[PHONE_PROVIDED]' : '[NO_PHONE]'
        }
    });

    const validatedOptions = OrderOptionsSchema.safeParse(options);

    if (!validatedOptions.success) {
        console.error('2. Validation failed with errors:', validatedOptions.error.errors);
        
        const errorMessages = validatedOptions.error.errors.map(err => {
            if (err.path.includes('phone')) {
                return `Phone number must be a valid 10-digit Indian number starting with 6-9`;
            }
            if (err.path.includes('email')) {
                return `Email must be a valid email address`;
            }
            if (err.path.includes('name')) {
                return `Name must be between 1-100 characters`;
            }
            if (err.path.includes('amount')) {
                return `Amount must be a positive number`;
            }
            return `Invalid ${err.path.join('.')}: ${err.message}`;
        });
        
        return { 
            success: false, 
            error: `Validation failed: ${errorMessages.join(', ')}`,
            validationErrors: validatedOptions.error.errors
        };
    }

    const { amount, userId, plan, user } = validatedOptions.data;
    console.log('3. Validation passed successfully');

    console.log('4. Checking environment variables...');
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('5. Environment variables missing:', {
            hasKeyId: !!process.env.RAZORPAY_KEY_ID,
            hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
            keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8)
        });
        return { success: false, error: "Payment gateway configuration error." };
    }

    console.log('5. Environment variables found:', {
        keyIdPrefix: process.env.RAZORPAY_KEY_ID.substring(0, 8),
        isTestKey: process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_')
    });

    let razorpay;
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('6. Razorpay instance created successfully');
    } catch (error) {
        console.error('7. Failed to create Razorpay instance:', error);
        return { success: false, error: "Failed to initialize payment gateway." };
    }
    
    // Generate a compliant receipt ID (max 40 characters)
    const receiptId = generateReceiptId(userId);
    console.log('8. Generated receipt ID:', receiptId, 'Length:', receiptId.length);
    
    const orderOptions = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: receiptId, // Now guaranteed to be ≤ 40 characters
        notes: {
            userId: userId,
            plan: plan,
            user_name: user.name,
            user_email: user.email
        }
    };

    console.log('9. Order options prepared:', {
        ...orderOptions,
        notes: { ...orderOptions.notes, user_email: '[EMAIL_PROVIDED]' }
    });

    if (orderOptions.amount < 100) {
        console.error('10. Amount too small:', orderOptions.amount);
        return { success: false, error: "Minimum amount is ₹1." };
    }

    if (orderOptions.amount > 1500000) {
        console.error('10. Amount too large:', orderOptions.amount);
        return { success: false, error: "Maximum amount exceeded." };
    }

    try {
        console.log('11. Calling Razorpay API...');
        const order = await razorpay.orders.create(orderOptions);
        console.log('12. Order created successfully:', {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
            receipt: order.receipt
        });
        
        if (!order.id || !order.amount || order.status !== 'created') {
            console.error('13. Invalid order response:', order);
            return { success: false, error: "Invalid order response from payment gateway." };
        }
        
        return {
            success: true,
            order: {
                ...order,
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                userName: user.name,
                userEmail: user.email,
                userPhone: user.phone,
            }
        };
    } catch (error: any) {
        console.error('14. Razorpay API call failed:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error.error,
            description: error.description
        });
        
        if (error.statusCode === 400) {
            const errorMsg = error.error?.description || error.message || "Invalid request parameters";
            console.error('15. Bad request details:', errorMsg);
            return { success: false, error: `Invalid payment parameters: ${errorMsg}` };
        } else if (error.statusCode === 401) {
            console.error('15. Authentication failed - check your Razorpay keys');
            return { success: false, error: "Payment gateway authentication failed. Please check configuration." };
        } else if (error.statusCode === 429) {
            console.error('15. Rate limit exceeded');
            return { success: false, error: "Too many requests. Please try again later." };
        } else {
            console.error('15. Unknown error:', error);
            return { success: false, error: `Payment service error: ${error.message || 'Unknown error'}` };
        }
    }
}

// Rest of the functions remain the same
const PaymentSuccessSchema = z.object({
    razorpay_payment_id: z.string(),
    razorpay_order_id: z.string(),
    razorpay_signature: z.string(),
    userId: z.string(),
    plan: z.enum(['monthly', 'yearly']),
    amount: z.number()
});

type PaymentSuccessData = z.infer<typeof PaymentSuccessSchema>;

export async function handlePaymentSuccess(data: PaymentSuccessData) {
    const validatedData = PaymentSuccessSchema.safeParse(data);
    if (!validatedData.success) {
        console.error('Payment success validation failed:', validatedData.error);
        return { success: false, error: 'Invalid payment data' };
    }

    const { userId, plan, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = validatedData.data;
    
    try {
        const isSignatureValid = verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });

        if (!isSignatureValid) {
            console.error('Invalid payment signature');
            return { success: false, error: 'Payment verification failed' };
        }

        console.log('Payment signature verified successfully');
        
        const paymentRef = await addDoc(collection(db, "payments"), {
            userId,
            plan,
            amount,
            status: 'success',
            paymentDate: serverTimestamp(),
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        });
        
        console.log('Payment record created:', paymentRef.id);
        
        const userDocRef = doc(db, "users", userId);
        const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });
        
        await updateDoc(userDocRef, {
            subscription: {
                plan,
                status: 'active',
                renewalDate,
                lastPaymentId: paymentRef.id,
                updatedAt: serverTimestamp()
            }
        });
        
        console.log('User subscription updated successfully');
        
        return { success: true, message: 'Payment successful and recorded.' };
    } catch (error: any) {
        console.error("Error handling payment success:", error);
        return { success: false, error: `Failed to update database: ${error.message}` };
    }
}

function verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
}: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): boolean {
    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === razorpay_signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

// // razorpay.ts - Debug version to identify the exact issue
// 'use server';

// import Razorpay from 'razorpay';
// import { z } from 'zod';
// import { db } from '@/lib/firebase';
// import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { add } from 'date-fns';
// import crypto from 'crypto';

// const OrderOptionsSchema = z.object({
//   amount: z.number().positive().min(1), // Must be positive and at least 1
//   userId: z.string().min(1), // Must not be empty
//   plan: z.enum(['monthly', 'yearly']),
//   user: z.object({
//     name: z.string().min(1).max(100), // Name should be between 1-100 chars
//     email: z.string().email(), // Must be valid email
//     phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"), // Valid Indian phone number
//   })
// });

// type OrderOptions = z.infer<typeof OrderOptionsSchema>;

// export async function createRazorpayOrder(options: OrderOptions) {
//     console.log('=== RAZORPAY ORDER CREATION DEBUG ===');
//     console.log('1. Raw options received:', {
//         amount: options.amount,
//         userId: options.userId?.substring(0, 8) + '...',
//         plan: options.plan,
//         user: {
//             name: options.user?.name,
//             email: options.user?.email,
//             phone: options.user?.phone ? '[PHONE_PROVIDED]' : '[NO_PHONE]'
//         }
//     });

//     // Detailed validation with specific error messages
//     const validatedOptions = OrderOptionsSchema.safeParse(options);

//     if (!validatedOptions.success) {
//         console.error('2. Validation failed with errors:', validatedOptions.error.errors);
        
//         // Return specific validation errors
//         const errorMessages = validatedOptions.error.errors.map(err => {
//             if (err.path.includes('phone')) {
//                 return `Phone number must be a valid 10-digit Indian number starting with 6-9`;
//             }
//             if (err.path.includes('email')) {
//                 return `Email must be a valid email address`;
//             }
//             if (err.path.includes('name')) {
//                 return `Name must be between 1-100 characters`;
//             }
//             if (err.path.includes('amount')) {
//                 return `Amount must be a positive number`;
//             }
//             return `Invalid ${err.path.join('.')}: ${err.message}`;
//         });
        
//         return { 
//             success: false, 
//             error: `Validation failed: ${errorMessages.join(', ')}`,
//             validationErrors: validatedOptions.error.errors
//         };
//     }

//     const { amount, userId, plan, user } = validatedOptions.data;
//     console.log('3. Validation passed successfully');

//     // Check environment variables
//     console.log('4. Checking environment variables...');
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//         console.error('5. Environment variables missing:', {
//             hasKeyId: !!process.env.RAZORPAY_KEY_ID,
//             hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
//             keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8)
//         });
//         return { success: false, error: "Payment gateway configuration error." };
//     }

//     console.log('5. Environment variables found:', {
//         keyIdPrefix: process.env.RAZORPAY_KEY_ID.substring(0, 8),
//         isTestKey: process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_')
//     });

//     // Initialize Razorpay
//     let razorpay;
//     try {
//         razorpay = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET,
//         });
//         console.log('6. Razorpay instance created successfully');
//     } catch (error) {
//         console.error('7. Failed to create Razorpay instance:', error);
//         return { success: false, error: "Failed to initialize payment gateway." };
//     }
    
//     // Prepare order options
//     const orderOptions = {
//         amount: Math.round(amount * 100), // Ensure it's an integer (amount in paise)
//         currency: "INR",
//         receipt: `receipt_${userId}_${Date.now()}`, // Simplified receipt format
//         notes: {
//             userId: userId,
//             plan: plan,
//             user_name: user.name,
//             user_email: user.email
//         }
//     };

//     console.log('8. Order options prepared:', {
//         ...orderOptions,
//         notes: { ...orderOptions.notes, user_email: '[EMAIL_PROVIDED]' }
//     });

//     // Validate order options before sending to Razorpay
//     if (orderOptions.amount < 100) { // Razorpay minimum is ₹1 (100 paise)
//         console.error('9. Amount too small:', orderOptions.amount);
//         return { success: false, error: "Minimum amount is ₹1." };
//     }

//     if (orderOptions.amount > 1500000) { // Razorpay maximum is ₹15,000 (1500000 paise)
//         console.error('9. Amount too large:', orderOptions.amount);
//         return { success: false, error: "Maximum amount exceeded." };
//     }

//     try {
//         console.log('9. Calling Razorpay API...');
//         const order = await razorpay.orders.create(orderOptions);
//         console.log('10. Order created successfully:', {
//             id: order.id,
//             amount: order.amount,
//             currency: order.currency,
//             status: order.status
//         });
        
//         // Verify the order was created properly
//         if (!order.id || !order.amount || order.status !== 'created') {
//             console.error('11. Invalid order response:', order);
//             return { success: false, error: "Invalid order response from payment gateway." };
//         }
        
//         return {
//             success: true,
//             order: {
//                 ...order,
//                 key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
//                 userName: user.name,
//                 userEmail: user.email,
//                 userPhone: user.phone,
//             }
//         };
//     } catch (error: any) {
//         console.error('12. Razorpay API call failed:', {
//             message: error.message,
//             statusCode: error.statusCode,
//             error: error.error,
//             description: error.description
//         });
        
//         // More detailed error handling
//         if (error.statusCode === 400) {
//             const errorMsg = error.error?.description || error.message || "Invalid request parameters";
//             console.error('13. Bad request details:', errorMsg);
//             return { success: false, error: `Invalid payment parameters: ${errorMsg}` };
//         } else if (error.statusCode === 401) {
//             console.error('13. Authentication failed - check your Razorpay keys');
//             return { success: false, error: "Payment gateway authentication failed. Please check configuration." };
//         } else if (error.statusCode === 429) {
//             console.error('13. Rate limit exceeded');
//             return { success: false, error: "Too many requests. Please try again later." };
//         } else {
//             console.error('13. Unknown error:', error);
//             return { success: false, error: `Payment service error: ${error.message || 'Unknown error'}` };
//         }
//     }
// }

// // Rest of the code remains the same...
// const PaymentSuccessSchema = z.object({
//     razorpay_payment_id: z.string(),
//     razorpay_order_id: z.string(),
//     razorpay_signature: z.string(),
//     userId: z.string(),
//     plan: z.enum(['monthly', 'yearly']),
//     amount: z.number()
// });

// type PaymentSuccessData = z.infer<typeof PaymentSuccessSchema>;

// export async function handlePaymentSuccess(data: PaymentSuccessData) {
//     const validatedData = PaymentSuccessSchema.safeParse(data);
//     if (!validatedData.success) {
//         console.error('Payment success validation failed:', validatedData.error);
//         return { success: false, error: 'Invalid payment data' };
//     }

//     const { userId, plan, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = validatedData.data;
    
//     try {
//         // Verify payment signature
//         const isSignatureValid = verifyPaymentSignature({
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         });

//         if (!isSignatureValid) {
//             console.error('Invalid payment signature');
//             return { success: false, error: 'Payment verification failed' };
//         }

//         console.log('Payment signature verified successfully');
        
//         // 1. Add payment to 'payments' collection
//         const paymentRef = await addDoc(collection(db, "payments"), {
//             userId,
//             plan,
//             amount,
//             status: 'success',
//             paymentDate: serverTimestamp(),
//             razorpay_payment_id,
//             razorpay_order_id,
//             razorpay_signature
//         });
        
//         console.log('Payment record created:', paymentRef.id);
        
//         // 2. Update user's subscription
//         const userDocRef = doc(db, "users", userId);
//         const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });
        
//         await updateDoc(userDocRef, {
//             subscription: {
//                 plan,
//                 status: 'active',
//                 renewalDate,
//                 lastPaymentId: paymentRef.id,
//                 updatedAt: serverTimestamp()
//             }
//         });
        
//         console.log('User subscription updated successfully');
        
//         return { success: true, message: 'Payment successful and recorded.' };
//     } catch (error: any) {
//         console.error("Error handling payment success:", error);
//         return { success: false, error: `Failed to update database: ${error.message}` };
//     }
// }

// // Helper function to verify payment signature
// function verifyPaymentSignature({
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature
// }: {
//     razorpay_order_id: string;
//     razorpay_payment_id: string;
//     razorpay_signature: string;
// }): boolean {
//     try {
//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
//             .update(body.toString())
//             .digest('hex');

//         return expectedSignature === razorpay_signature;
//     } catch (error) {
//         console.error('Signature verification error:', error);
//         return false;
//     }
// }

// // razorpay.ts - Fixed version
// 'use server';

// import Razorpay from 'razorpay';
// import { z } from 'zod';
// import { db } from '@/lib/firebase';
// import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { add } from 'date-fns';
// import crypto from 'crypto';

// const OrderOptionsSchema = z.object({
//   amount: z.number(),
//   userId: z.string(),
//   plan: z.enum(['monthly', 'yearly']),
//   user: z.object({
//     name: z.string(),
//     email: z.string(),
//     phone: z.string(),
//   })
// });

// type OrderOptions = z.infer<typeof OrderOptionsSchema>;

// export async function createRazorpayOrder(options: OrderOptions) {
//     console.log('Creating Razorpay order with options:', { ...options, user: { ...options.user, phone: '[REDACTED]' } });
    
//     const validatedOptions = OrderOptionsSchema.safeParse(options);

//     if (!validatedOptions.success) {
//         console.error('Validation failed:', validatedOptions.error);
//         return { success: false, error: "Invalid options provided." };
//     }

//     const { amount, userId, plan, user } = validatedOptions.data;

//     // Check if environment variables are set
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//         console.error('Razorpay credentials missing');
//         return { success: false, error: "Payment gateway configuration error." };
//     }

//     const razorpay = new Razorpay({
//         key_id: process.env.RAZORPAY_KEY_ID,
//         key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });
    
//     const orderOptions = {
//         amount: amount * 100, // amount in the smallest currency unit
//         currency: "INR",
//         receipt: `receipt_user_${userId}_${Date.now()}`,
//         notes: {
//             userId: userId,
//             plan: plan
//         }
//     };

//     try {
//         console.log('Creating order with Razorpay API:', { ...orderOptions, notes: { ...orderOptions.notes } });
//         const order = await razorpay.orders.create(orderOptions);
//         console.log('Order created successfully:', order.id);
        
//         return {
//             success: true,
//             order: {
//                 ...order,
//                 key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
//                 userName: user.name,
//                 userEmail: user.email,
//                 userPhone: user.phone,
//             }
//         };
//     } catch (error: any) {
//         console.error("Razorpay order creation failed:", error);
//         console.error("Error details:", {
//             message: error.message,
//             code: error.statusCode,
//             response: error.error
//         });
        
//         // Return more specific error messages
//         if (error.statusCode === 400) {
//             return { success: false, error: "Invalid payment parameters." };
//         } else if (error.statusCode === 401) {
//             return { success: false, error: "Payment gateway authentication failed." };
//         } else {
//             return { success: false, error: `Payment service error: ${error.message}` };
//         }
//     }
// }

// const PaymentSuccessSchema = z.object({
//     razorpay_payment_id: z.string(),
//     razorpay_order_id: z.string(),
//     razorpay_signature: z.string(),
//     userId: z.string(),
//     plan: z.enum(['monthly', 'yearly']),
//     amount: z.number()
// });

// type PaymentSuccessData = z.infer<typeof PaymentSuccessSchema>;

// export async function handlePaymentSuccess(data: PaymentSuccessData) {
//     const validatedData = PaymentSuccessSchema.safeParse(data);
//     if (!validatedData.success) {
//         console.error('Payment success validation failed:', validatedData.error);
//         return { success: false, error: 'Invalid payment data' };
//     }

//     const { userId, plan, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = validatedData.data;
    
//     try {
//         // Verify payment signature
//         const isSignatureValid = verifyPaymentSignature({
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         });

//         if (!isSignatureValid) {
//             console.error('Invalid payment signature');
//             return { success: false, error: 'Payment verification failed' };
//         }

//         console.log('Payment signature verified successfully');
        
//         // 1. Add payment to 'payments' collection
//         const paymentRef = await addDoc(collection(db, "payments"), {
//             userId,
//             plan,
//             amount,
//             status: 'success',
//             paymentDate: serverTimestamp(),
//             razorpay_payment_id,
//             razorpay_order_id,
//             razorpay_signature
//         });
        
//         console.log('Payment record created:', paymentRef.id);
        
//         // 2. Update user's subscription
//         const userDocRef = doc(db, "users", userId);
//         const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });
        
//         await updateDoc(userDocRef, {
//             subscription: {
//                 plan,
//                 status: 'active',
//                 renewalDate,
//                 lastPaymentId: paymentRef.id,
//                 updatedAt: serverTimestamp()
//             }
//         });
        
//         console.log('User subscription updated successfully');
        
//         return { success: true, message: 'Payment successful and recorded.' };
//     } catch (error: any) {
//         console.error("Error handling payment success:", error);
//         return { success: false, error: `Failed to update database: ${error.message}` };
//     }
// }

// // Helper function to verify payment signature
// function verifyPaymentSignature({
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature
// }: {
//     razorpay_order_id: string;
//     razorpay_payment_id: string;
//     razorpay_signature: string;
// }): boolean {
//     try {
//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
//             .update(body.toString())
//             .digest('hex');

//         return expectedSignature === razorpay_signature;
//     } catch (error) {
//         console.error('Signature verification error:', error);
//         return false;
//     }
// }