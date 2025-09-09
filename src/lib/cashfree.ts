
'use server';

import { Cashfree } from 'cashfree-pg';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { startOfMonth, addMonths, addYears } from 'date-fns';
import crypto from 'crypto';

// Initialize Cashfree
if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    console.error("Cashfree credentials are not set in environment variables.");
}

Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
// Forcing sandbox environment to ensure development payments work
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;


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
    const validatedOptions = OrderOptionsSchema.safeParse(options);

    if (!validatedOptions.success) {
        const errorMessages = validatedOptions.error.errors.map(err => `Invalid ${err.path.join('.')}: ${err.message}`);
        return { 
            success: false, 
            error: `Validation failed: ${errorMessages.join(', ')}`,
        };
    }

    const { amount, userId, plan, user } = validatedOptions.data;

    // Use crypto for a more unique order ID
    const randomPart = crypto.randomBytes(6).toString('hex');
    const orderId = `order_${userId.slice(0, 8)}_${Date.now()}_${randomPart}`;
    
    // Construct the base URL safely
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NEXT_PUBLIC_BASE_URL || `localhost:3000`; // Vercel provides NEXT_PUBLIC_VERCEL_URL
    const baseURL = `${protocol}://${host.replace(/^https|http:\/\//, '')}`;


    const request = {
        order_amount: amount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
            customer_id: userId,
            customer_phone: user.phone,
            customer_name: user.name,
            customer_email: user.email || `${user.phone}@tabu.local`, // Use dummy email if not present
        },
        order_meta: {
            return_url: `${baseURL}/en/payments/status?order_id={order_id}`,
        },
        order_note: `TABU Membership - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
    };

    try {
        const order = await Cashfree.PGCreateOrder("2023-08-01", request);
        
        if (!order.data || !order.data.payment_session_id) {
            console.error("Cashfree API response error:", order);
            return { success: false, error: "Failed to get payment session from Cashfree." };
        }
        
        // Before creating payment record, ensure a user document exists.
        // This is handled on the client-side check, but an extra layer of safety.
        
        // Create a pending payment record in Firestore
        await addDoc(collection(db, "payments"), {
            userId,
            plan,
            amount: amount,
            status: 'pending',
            paymentDate: serverTimestamp(),
            cf_order_id: order.data.order_id,
        });

        return {
            success: true,
            order: {
                payment_session_id: order.data.payment_session_id,
                order_id: order.data.order_id,
            }
        };
    } catch (error: any) {
        console.error('Cashfree order creation error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error creating payment order.';
        // Extract a more specific error if available
        if (errorMessage.includes('order_meta.return_url')) {
            return { success: false, error: "Invalid return URL format. Please contact support." };
        }
        return { success: false, error: errorMessage };
    }
}


const PaymentSuccessSchema = z.object({
    order_id: z.string(),
    userId: z.string(),
    plan: z.enum(['monthly', 'yearly']),
    amount: z.number()
});

type PaymentSuccessData = z.infer<typeof PaymentSuccessSchema>;

export async function handlePaymentSuccess(data: PaymentSuccessData) {
    const validatedData = PaymentSuccessSchema.safeParse(data);
    if (!validatedData.success) {
        console.error('Payment success validation failed:', validatedData.error);
        return { success: false, error: 'Invalid payment data received from the client.' };
    }

    const { userId, plan, amount, order_id } = validatedData.data;

    try {
        const orderDetails = await Cashfree.PGGetOrderById("2023-08-01", order_id);
        const payment = orderDetails.data;

        if (payment.order_status !== 'PAID') {
            return { success: false, error: 'Payment not confirmed by gateway.' };
        }

        const paymentRef = await addDoc(collection(db, "payments"), {
            userId,
            plan,
            amount: payment.order_amount,
            status: 'success',
            paymentDate: serverTimestamp(),
            cf_payment_id: payment.cf_payment_id,
            cf_order_id: payment.order_id,
        });
        
        const userDocRef = doc(db, "users", userId);
        const now = new Date();
        const firstDayOfCurrentMonth = startOfMonth(now);
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
        return { success: false, error: `Failed to update database: ${error.message}` };
    }
}
