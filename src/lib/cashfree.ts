'use server';

import { Cashfree } from 'cashfree-pg';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, limit, getDoc } from "firebase/firestore";
import { startOfMonth, addMonths, addYears } from 'date-fns';
import crypto from 'crypto';

// Initialize Cashfree with proper error handling
if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    throw new Error("Cashfree credentials are not set in environment variables.");
}

Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
// Use environment variable to control sandbox/production
Cashfree.XEnvironment = process.env.NODE_ENV === 'production' 
    ? Cashfree.Environment.PRODUCTION 
    : Cashfree.Environment.SANDBOX;

const OrderOptionsSchema = z.object({
  amount: z.number().positive().min(1),
  userId: z.string().min(1),
  plan: z.enum(['monthly', 'yearly']),
  user: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
    email: z.string().email().optional().or(z.literal('')),
  })
});

type OrderOptions = z.infer<typeof OrderOptionsSchema>;

export async function createCashfreeOrder(options: OrderOptions) {
    try {
        const validatedOptions = OrderOptionsSchema.safeParse(options);

        if (!validatedOptions.success) {
            const errorMessages = validatedOptions.error.errors.map(err => 
                `Invalid ${err.path.join('.')}: ${err.message}`
            );
            console.error("Server validation failed:", errorMessages);
            return { 
                success: false, 
                error: `Validation failed: ${errorMessages.join(', ')}` 
            };
        }

        const { amount, userId, plan, user } = validatedOptions.data;
        
        // Check if user exists
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { 
                success: false, 
                error: "User not found. Please log in again." 
            };
        }

        // Generate unique order ID
        const timestamp = Date.now();
        const randomPart = crypto.randomBytes(4).toString('hex');
        const orderId = `order_${userId.slice(0, 8)}_${timestamp}_${randomPart}`;
        
        // Check for duplicate order ID (very unlikely but good practice)
        const existingOrderQuery = query(
            collection(db, "payments"), 
            where("cf_order_id", "==", orderId),
            limit(1)
        );
        const existingOrderSnapshot = await getDocs(existingOrderQuery);
        if (!existingOrderSnapshot.empty) {
            return { 
                success: false, 
                error: "Order ID conflict. Please try again." 
            };
        }
        
        // Build return URL
        const vercelUrl = process.env.VERCEL_URL;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
            (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000');
        const returnUrl = `${baseUrl}/en/payments/status?order_id={order_id}`;

        // Prepare Cashfree order request
        const request = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: userId.slice(0, 50), // Cashfree has limits
                customer_phone: user.phone,
                customer_name: user.name.slice(0, 100), // Ensure length limit
                customer_email: user.email || `${user.phone}@tabu.local`,
            },
            order_meta: {
                return_url: returnUrl,
            },
            order_note: `TABU Membership - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            order_tags: {
                plan: plan,
                userId: userId
            }
        };

        console.log("Creating Cashfree order:", { orderId, amount, plan, userId });

        // Create order with Cashfree
        const order = await Cashfree.PGCreateOrder("2023-08-01", request);

        if (!order.data) {
            console.error("Cashfree API response error:", order);
            return { 
                success: false, 
                error: "Failed to create payment order. Please try again." 
            };
        }

        if (!order.data.payment_session_id) {
            console.error("Missing payment_session_id:", order.data);
            return { 
                success: false, 
                error: "Invalid payment session. Please try again." 
            };
        }
        
        // Store payment record in database
        const paymentData = {
            userId,
            plan,
            amount,
            status: 'pending',
            createdAt: serverTimestamp(),
            paymentDate: null, // Will be set when payment is successful
            cf_order_id: order.data.order_id,
            cf_payment_id: null, // Will be set when payment is verified
            order_meta: {
                customer_name: user.name,
                customer_phone: user.phone,
                customer_email: user.email || `${user.phone}@tabu.local`,
            }
        };

        await addDoc(collection(db, "payments"), paymentData);

        console.log("Payment order created successfully:", order.data.order_id);

        return {
            success: true,
            payment_link: order.data.payment_link,
            order_id: order.data.order_id,
            payment_session_id: order.data.payment_session_id
        };

    } catch (error: any) {
        console.error('Cashfree order creation error:', error);
        
        // Handle specific Cashfree errors
        if (error.response?.data) {
            const cfError = error.response.data;
            console.error('Cashfree API Error:', cfError);
            
            if (cfError.type === 'invalid_request_error') {
                return { 
                    success: false, 
                    error: `Invalid request: ${cfError.message || 'Please check your payment details.'}` 
                };
            }
            
            if (cfError.type === 'authentication_error') {
                return { 
                    success: false, 
                    error: 'Payment service configuration error. Please contact support.' 
                };
            }
        }
        
        return { 
            success: false, 
            error: error.message || 'An unexpected error occurred while creating payment order.' 
        };
    }
}

export async function verifyPaymentAndUpdate(order_id: string) {
    try {
        if (!order_id || typeof order_id !== 'string') {
            return { 
                success: false, 
                status: 'INVALID_ORDER_ID', 
                message: 'Invalid order ID provided.' 
            };
        }

        console.log("Verifying payment for order:", order_id);

        // Get order details from Cashfree
        let orderDetails;
        try {
            orderDetails = await Cashfree.PGGetOrderById("2023-08-01", order_id);
        } catch (cfError: any) {
            console.error("Cashfree API error:", cfError);
            
            if (cfError.response?.status === 404) {
                return { 
                    success: false, 
                    status: 'ORDER_NOT_FOUND', 
                    message: 'Order not found with payment gateway.' 
                };
            }
            
            return { 
                success: false, 
                status: 'GATEWAY_ERROR', 
                message: 'Unable to verify payment with gateway. Please try again.' 
            };
        }

        const paymentInfo = orderDetails.data;
        console.log("Payment info from Cashfree:", { 
            order_id: paymentInfo.order_id, 
            order_status: paymentInfo.order_status 
        });

        // Find payment record in database
        const paymentsRef = collection(db, "payments");
        const q = query(paymentsRef, where("cf_order_id", "==", order_id), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("Payment record not found in database:", order_id);
            return { 
                success: false, 
                status: 'NOT_FOUND', 
                message: 'Payment record not found. Please contact support.' 
            };
        }
        
        const paymentDoc = querySnapshot.docs[0];
        const paymentData = paymentDoc.data();
        
        // Check if already processed
        if (paymentData.status === 'success') {
            console.log("Payment already processed:", order_id);
            return { 
                success: true, 
                status: 'ALREADY_PROCESSED', 
                message: 'Payment already verified and processed.' 
            };
        }

        // Handle different payment statuses
        if (paymentInfo.order_status === 'PAID') {
            // Payment successful - update records
            const batch = writeBatch(db);
            
            // Update payment record
            batch.update(paymentDoc.ref, {
                status: 'success',
                cf_payment_id: paymentInfo.cf_payment_id || null,
                paymentDate: serverTimestamp(),
                gateway_response: {
                    order_status: paymentInfo.order_status,
                    payment_method: paymentInfo.payment_method || null,
                    bank_reference: paymentInfo.bank_reference || null,
                },
                updatedAt: serverTimestamp(),
            });
            
            // Update user subscription
            const userId = paymentData.userId;
            const plan = paymentData.plan;
            const userDocRef = doc(db, "users", userId);
            
            // Verify user still exists
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                return { 
                    success: false, 
                    status: 'USER_NOT_FOUND', 
                    message: 'User account not found. Please contact support.' 
                };
            }
            
            const now = new Date();
            const firstDayOfCurrentMonth = startOfMonth(now);
            const renewalDate = plan === 'monthly' 
                ? addMonths(firstDayOfCurrentMonth, 1) 
                : addYears(firstDayOfCurrentMonth, 1);
                
            batch.update(userDocRef, {
                "subscription.status": 'active',
                "subscription.plan": plan,
                "subscription.renewalDate": renewalDate,
                "subscription.lastPaymentId": paymentDoc.id,
                "subscription.lastPaymentDate": serverTimestamp(),
                "subscription.updatedAt": serverTimestamp()
            });
            
            await batch.commit();
            
            console.log("Payment verified and user updated:", { userId, order_id });

            return { 
                success: true, 
                status: 'PAID', 
                message: 'Payment successful! Your subscription is now active.' 
            };

        } else if (paymentInfo.order_status === 'ACTIVE') {
            // Payment still pending
            return { 
                success: false, 
                status: 'PENDING', 
                message: 'Payment is still being processed. Please wait a moment and check again.' 
            };

        } else if (['FAILED', 'CANCELLED', 'TERMINATED'].includes(paymentInfo.order_status)) {
            // Payment failed - update status
            await updateDoc(paymentDoc.ref, {
                status: 'failed',
                gateway_response: {
                    order_status: paymentInfo.order_status,
                    failure_reason: paymentInfo.failure_reason || null,
                },
                updatedAt: serverTimestamp(),
            });

            const failureMessage = paymentInfo.failure_reason 
                ? `Payment ${paymentInfo.order_status.toLowerCase()}: ${paymentInfo.failure_reason}`
                : `Payment ${paymentInfo.order_status.toLowerCase()}. Please try again.`;

            return { 
                success: false, 
                status: paymentInfo.order_status, 
                message: failureMessage 
            };

        } else {
            // Unknown status
            console.warn("Unknown payment status:", paymentInfo.order_status);
            return { 
                success: false, 
                status: paymentInfo.order_status, 
                message: `Payment status: ${paymentInfo.order_status}. Please contact support if this persists.` 
            };
        }

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return { 
            success: false, 
            status: 'ERROR', 
            message: `Verification failed: ${error.message}. Please try again or contact support.` 
        };
    }
}


// 'use server';

// import { Cashfree } from 'cashfree-pg';
// import { z } from 'zod';
// import { db } from '@/lib/firebase';
// import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, limit } from "firebase/firestore";
// import { startOfMonth, addMonths, addYears } from 'date-fns';
// import crypto from 'crypto';

// // Initialize Cashfree
// if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
//     console.error("Cashfree credentials are not set in environment variables.");
// }

// Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
// Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
// Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Use SANDBOX for testing, PRODUCTION for live

// const OrderOptionsSchema = z.object({
//   amount: z.number().positive().min(1),
//   userId: z.string().min(1),
//   plan: z.enum(['monthly', 'yearly']),
//   user: z.object({
//     name: z.string().min(1).max(100),
//     phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
//     email: z.string().email().optional().or(z.literal('')),
//   })
// });

// type OrderOptions = z.infer<typeof OrderOptionsSchema>;

// export async function createCashfreeOrder(options: OrderOptions) {
//     const validatedOptions = OrderOptionsSchema.safeParse(options);

//     if (!validatedOptions.success) {
//         const errorMessages = validatedOptions.error.errors.map(err => `Invalid ${err.path.join('.')}: ${err.message}`);
//         console.error("Server validation failed:", errorMessages);
//         return { success: false, error: `Validation failed: ${errorMessages.join(', ')}` };
//     }

//     const { amount, userId, plan, user } = validatedOptions.data;
//     const randomPart = crypto.randomBytes(6).toString('hex');
//     const orderId = `order_${userId.slice(0, 8)}_${Date.now()}_${randomPart}`;
    
//     const vercelUrl = process.env.VERCEL_URL;
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:9002');
//     const returnUrl = `${baseUrl}/en/payments/status?order_id={order_id}`;

//     const request = {
//         order_amount: amount,
//         order_currency: "INR",
//         order_id: orderId,
//         customer_details: {
//             customer_id: userId,
//             customer_phone: user.phone,
//             customer_name: user.name,
//             customer_email: user.email || `${user.phone}@tabu.local`,
//         },
//         order_meta: {
//             return_url: returnUrl,
//         },
//         order_note: `TABU Membership - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
//     };

//     try {
//         const order = await Cashfree.PGCreateOrder("2023-08-01", request);

//         if (!order.data || !order.data.payment_session_id) {
//             console.error("Cashfree API response error:", order.data);
//             return { success: false, error: "Failed to get payment session from Cashfree." };
//         }
        
//         await addDoc(collection(db, "payments"), {
//             userId,
//             plan,
//             amount,
//             status: 'pending',
//             paymentDate: serverTimestamp(),
//             cf_order_id: order.data.order_id,
//         });

//         return {
//             success: true,
//             payment_link: order.data.payment_link
//         };
//     } catch (error: any) {
//         console.error('Cashfree order creation error:', error);
//         return { success: false, error: error.response?.data?.message || error.message || 'Unknown error creating payment order.' };
//     }
// }

// export async function verifyPaymentAndUpdate(order_id: string) {
//     try {
//         const orderDetails = await Cashfree.PGGetOrderById("2023-08-01", order_id);
//         const paymentInfo = orderDetails.data;

//         if (paymentInfo.order_status !== 'PAID') {
//             return { success: false, status: paymentInfo.order_status, message: 'Payment not confirmed by gateway.' };
//         }

//         const paymentsRef = collection(db, "payments");
//         const q = query(paymentsRef, where("cf_order_id", "==", order_id), limit(1));
//         const querySnapshot = await getDocs(q);

//         if (querySnapshot.empty) {
//             return { success: false, status: 'NOT_FOUND', message: 'Payment record not found in our database.' };
//         }
        
//         const paymentDoc = querySnapshot.docs[0];
//         if (paymentDoc.data().status === 'success') {
//             return { success: true, status: 'ALREADY_PROCESSED', message: 'Payment already verified.' };
//         }
        
//         const batch = writeBatch(db);
        
//         batch.update(paymentDoc.ref, {
//             status: 'success',
//             cf_payment_id: paymentInfo.cf_payment_id || null,
//             paymentDate: serverTimestamp(),
//         });
        
//         const userId = paymentDoc.data().userId;
//         const plan = paymentDoc.data().plan;
//         const userDocRef = doc(db, "users", userId);
        
//         const now = new Date();
//         const firstDayOfCurrentMonth = startOfMonth(now);
//         const renewalDate = plan === 'monthly' 
//             ? addMonths(firstDayOfCurrentMonth, 1) 
//             : addYears(firstDayOfCurrentMonth, 1);
            
//         batch.update(userDocRef, {
//             "subscription.status": 'active',
//             "subscription.plan": plan,
//             "subscription.renewalDate": renewalDate,
//             "subscription.lastPaymentId": paymentDoc.id,
//             "subscription.updatedAt": serverTimestamp()
//         });
        
//         await batch.commit();

//         return { success: true, status: 'PAID', message: 'Payment successful and recorded.' };

//     } catch (error: any) {
//         console.error("Error verifying payment:", error);
//         return { success: false, status: 'ERROR', message: `Failed to verify payment: ${error.message}` };
//     }
// }
