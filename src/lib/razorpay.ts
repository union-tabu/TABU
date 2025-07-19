// razorpay.ts - Fixed version
'use server';

import Razorpay from 'razorpay';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { add } from 'date-fns';
import crypto from 'crypto';

const OrderOptionsSchema = z.object({
  amount: z.number(),
  userId: z.string(),
  plan: z.enum(['monthly', 'yearly']),
  user: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  })
});

type OrderOptions = z.infer<typeof OrderOptionsSchema>;

export async function createRazorpayOrder(options: OrderOptions) {
    console.log('Creating Razorpay order with options:', { ...options, user: { ...options.user, phone: '[REDACTED]' } });
    
    const validatedOptions = OrderOptionsSchema.safeParse(options);

    if (!validatedOptions.success) {
        console.error('Validation failed:', validatedOptions.error);
        return { success: false, error: "Invalid options provided." };
    }

    const { amount, userId, plan, user } = validatedOptions.data;

    // Check if environment variables are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Razorpay credentials missing');
        return { success: false, error: "Payment gateway configuration error." };
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    const orderOptions = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_user_${userId}_${Date.now()}`,
        notes: {
            userId: userId,
            plan: plan
        }
    };

    try {
        console.log('Creating order with Razorpay API:', { ...orderOptions, notes: { ...orderOptions.notes } });
        const order = await razorpay.orders.create(orderOptions);
        console.log('Order created successfully:', order.id);
        
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
        console.error("Razorpay order creation failed:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.statusCode,
            response: error.error
        });
        
        // Return more specific error messages
        if (error.statusCode === 400) {
            return { success: false, error: "Invalid payment parameters." };
        } else if (error.statusCode === 401) {
            return { success: false, error: "Payment gateway authentication failed." };
        } else {
            return { success: false, error: `Payment service error: ${error.message}` };
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

export async function handlePaymentSuccess(data: PaymentSuccessData) {
    const validatedData = PaymentSuccessSchema.safeParse(data);
    if (!validatedData.success) {
        console.error('Payment success validation failed:', validatedData.error);
        return { success: false, error: 'Invalid payment data' };
    }

    const { userId, plan, amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = validatedData.data;
    
    try {
        // Verify payment signature
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
        
        // 1. Add payment to 'payments' collection
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
        
        // 2. Update user's subscription
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

// Helper function to verify payment signature
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