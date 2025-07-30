
'use server';

import Razorpay from 'razorpay';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { startOfMonth, addMonths, addYears, endOfMonth } from 'date-fns';
import crypto from 'crypto';

const OrderOptionsSchema = z.object({
  amount: z.number().positive().min(1),
  userId: z.string().min(1),
  plan: z.enum(['monthly', 'yearly']),
  user: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  })
});

type OrderOptions = z.infer<typeof OrderOptionsSchema>;

// Helper function to generate a short receipt ID (max 40 chars)
function generateReceiptId(userId: string): string {
  const userIdPrefix = userId.substring(0, 8);
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const receipt = `rcpt_${userIdPrefix}_${timestamp}`;
  
  return receipt.length > 40 ? receipt.substring(0, 40) : receipt;
}

export async function createRazorpayOrder(options: OrderOptions) {
    const validatedOptions = OrderOptionsSchema.safeParse(options);

    if (!validatedOptions.success) {
        const errorMessages = validatedOptions.error.errors.map(err => {
            if (err.path.includes('phone')) {
                return `Phone number must be a valid 10-digit Indian number starting with 6-9`;
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

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return { success: false, error: "Payment gateway configuration error." };
    }

    let razorpay;
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    } catch (error) {
        console.error('Failed to create Razorpay instance:', error);
        return { success: false, error: "Failed to initialize payment gateway." };
    }
    
    const receiptId = generateReceiptId(userId);
    
    const orderOptions = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: receiptId,
        notes: {
            userId: userId,
            plan: plan,
            user_name: user.name,
        }
    };

    if (orderOptions.amount < 100) {
        return { success: false, error: "Minimum amount is ₹1." };
    }

    if (orderOptions.amount > 1500000) {
        return { success: false, error: "Maximum amount exceeded." };
    }

    try {
        const order = await razorpay.orders.create(orderOptions);
        
        if (!order.id || !order.amount || order.status !== 'created') {
            return { success: false, error: "Invalid order response from payment gateway." };
        }
        
        return {
            success: true,
            order: {
                ...order,
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                userName: user.name,
                userPhone: user.phone,
            }
        };
    } catch (error: any) {
        if (error.statusCode === 400) {
            const errorMsg = error.error?.description || error.message || "Invalid request parameters";
            return { success: false, error: `Invalid payment parameters: ${errorMsg}` };
        } else if (error.statusCode === 401) {
            return { success: false, error: "Payment gateway authentication failed. Please check configuration." };
        } else if (error.statusCode === 429) {
            return { success: false, error: "Too many requests. Please try again later." };
        } else {
            return { success: false, error: `Payment service error: ${error.message || 'Unknown error'}` };
        }
    }
}

const PaymentSuccessSchema = z.object({
    razorpay_payment_id: z.string(),
    razorpay_order_id: z.string(),
    razorpay_signature: z.string(),
    userId: z.string(),
    plan: z.enum(['monthly', 'yearly']),
    amount: z.number()
});

type PaymentSuccessData = z.infer<typeof PaymentSuccessSchema>;

function verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
}: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): boolean {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay key secret is not configured.");
        return false;
    }
    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === razorpay_signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}


export async function handlePaymentSuccess(data: PaymentSuccessData) {
    const validatedData = PaymentSuccessSchema.safeParse(data);
    if (!validatedData.success) {
        console.error('Payment success validation failed:', validatedData.error);
        return { success: false, error: 'Invalid payment data received from the client.' };
    }

    const { userId, plan, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = validatedData.data;
    
    // 1. Verify payment signature
    const isSignatureValid = verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    });

    if (!isSignatureValid) {
        console.error('Invalid payment signature');
        // It's important to not give too much information to the client here
        return { success: false, error: 'Payment verification failed.' };
    }

    try {
        // 2. Add a new record to the `payments` collection
        const paymentRef = await addDoc(collection(db, "payments"), {
            userId,
            plan,
            amount,
            status: 'success',
            paymentDate: serverTimestamp(),
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature // Store for auditing purposes
        });
        
        // 3. Update the `users` collection
        const userDocRef = doc(db, "users", userId);
        const now = new Date();
        // The subscription starts from the first day of the current month.
        const firstDayOfCurrentMonth = startOfMonth(now);
        // The renewal date is the first day of the next subscription period.
        const renewalDate = plan === 'monthly' 
            ? addMonths(firstDayOfCurrentMonth, 1) 
            : addYears(firstDayOfCurrentMonth, 1);
        
        await updateDoc(userDocRef, {
            subscription: {
                plan,
                status: 'active',
                renewalDate,
                lastPaymentId: paymentRef.id,
                updatedAt: serverTimestamp()
            }
        });
        
        return { success: true, message: 'Payment successful and recorded.' };

    } catch (error: any) {
        console.error("Error handling payment success:", error);
        // This will catch errors from either addDoc or updateDoc
        return { success: false, error: `Failed to update database: ${error.message}` };
    }
}
