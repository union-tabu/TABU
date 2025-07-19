
'use server';

import Razorpay from 'razorpay';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { add } from 'date-fns';

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

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(options: OrderOptions) {
    const validatedOptions = OrderOptionsSchema.safeParse(options);

    if (!validatedOptions.success) {
        return { success: false, error: "Invalid options provided." };
    }

    const { amount, userId, plan, user } = validatedOptions.data;
    
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
        const order = await razorpay.orders.create(orderOptions);
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
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        return { success: false, error: "Could not create order." };
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
        return { success: false, error: 'Invalid payment data' };
    }

    const { userId, plan, amount, ...razorpayData } = validatedData.data;
    
    try {
        // 1. Add payment to 'payments' collection
        const paymentRef = await addDoc(collection(db, "payments"), {
            userId,
            plan,
            amount,
            status: 'success',
            paymentDate: serverTimestamp(),
            ...razorpayData
        });
        
        // 2. Update user's subscription
        const userDocRef = doc(db, "users", userId);
        const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });
        
        await updateDoc(userDocRef, {
            subscription: {
                plan,
                status: 'active',
                renewalDate,
                lastPaymentId: paymentRef.id,
            }
        });
        
        return { success: true, message: 'Payment successful and recorded.' };
    } catch (error) {
        console.error("Error handling payment success:", error);
        return { success: false, error: "Failed to update database after payment." };
    }
}
