
'use server';

import { Cashfree } from 'cashfree-pg';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, limit } from "firebase/firestore";
import { startOfMonth, addMonths, addYears } from 'date-fns';
import crypto from 'crypto';

// Initialize Cashfree
if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    console.error("Cashfree credentials are not set in environment variables.");
}

Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Use SANDBOX for testing, PRODUCTION for live

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
        console.error("Server validation failed:", errorMessages);
        return { success: false, error: `Validation failed: ${errorMessages.join(', ')}` };
    }

    const { amount, userId, plan, user } = validatedOptions.data;
    const randomPart = crypto.randomBytes(6).toString('hex');
    const orderId = `order_${userId.slice(0, 8)}_${Date.now()}_${randomPart}`;
    
    // Determine the base URL. Fallback to VERCEL_URL if NEXT_PUBLIC_BASE_URL is not set.
    const vercelUrl = process.env.VERCEL_URL;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:9002');
    const returnUrl = `${baseUrl}/en/payments/status?order_id={order_id}`;

    const request = {
        order_amount: amount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
            customer_id: userId,
            customer_phone: user.phone,
            customer_name: user.name,
            customer_email: user.email || `${user.phone}@tabu.local`,
        },
        order_meta: {
            return_url: returnUrl,
        },
        order_note: `TABU Membership - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
    };

    try {
        const order = await Cashfree.PGCreateOrder("2023-08-01", request);

        if (!order.data || !order.data.payment_session_id) {
            console.error("Cashfree API response error:", order.data);
            return { success: false, error: "Failed to get payment session from Cashfree." };
        }
        
        await addDoc(collection(db, "payments"), {
            userId,
            plan,
            amount,
            status: 'pending',
            paymentDate: serverTimestamp(),
            cf_order_id: order.data.order_id,
        });

        return {
            success: true,
            payment_link: order.data.payment_link
        };
    } catch (error: any) {
        console.error('Cashfree order creation error:', error);
        return { success: false, error: error.response?.data?.message || error.message || 'Unknown error creating payment order.' };
    }
}

export async function verifyPaymentAndUpdate(order_id: string) {
    try {
        const orderDetails = await Cashfree.PGGetOrderById("2023-08-01", order_id);
        const paymentInfo = orderDetails.data;

        if (paymentInfo.order_status !== 'PAID') {
            return { success: false, status: paymentInfo.order_status, message: 'Payment not confirmed by gateway.' };
        }

        const paymentsRef = collection(db, "payments");
        const q = query(paymentsRef, where("cf_order_id", "==", order_id), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, status: 'NOT_FOUND', message: 'Payment record not found in our database.' };
        }
        
        const paymentDoc = querySnapshot.docs[0];
        if (paymentDoc.data().status === 'success') {
            // Already processed
            return { success: true, status: 'ALREADY_PROCESSED', message: 'Payment already verified.' };
        }
        
        const batch = writeBatch(db);
        
        // 1. Update the payment document
        batch.update(paymentDoc.ref, {
            status: 'success',
            cf_payment_id: paymentInfo.cf_payment_id || null,
            paymentDate: serverTimestamp(),
        });
        
        // 2. Update the user's subscription
        const userId = paymentDoc.data().userId;
        const plan = paymentDoc.data().plan;
        const userDocRef = doc(db, "users", userId);
        
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
            "subscription.updatedAt": serverTimestamp()
        });
        
        await batch.commit();

        return { success: true, status: 'PAID', message: 'Payment successful and recorded.' };

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return { success: false, status: 'ERROR', message: `Failed to verify payment: ${error.message}` };
    }
}
