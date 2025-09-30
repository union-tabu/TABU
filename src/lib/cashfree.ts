
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, limit, getDoc } from "firebase/firestore";
import { startOfMonth, addMonths, addYears } from 'date-fns';
import fetch from 'node-fetch';

const CASHFREE_API_URL = 'https://api.cashfree.com/pg';

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
            const errorMessages = validatedOptions.error.errors.map(err => `Invalid ${err.path.join('.')}: ${err.message}`);
            return { success: false, error: `Validation failed: ${errorMessages.join(', ')}` };
        }

        const { amount, userId, plan, user } = validatedOptions.data;
        
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { success: false, error: "User not found. Please log in again." };
        }

        const orderId = `TABU_${userId.substring(0, 8)}_${Date.now()}`;
        
        const lang = 'en';
        
        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        if (process.env.NODE_ENV === 'production') {
            baseUrl = `https://${process.env.VERCEL_URL || 'tabu.vercel.app'}`;
        }
        
        const returnUrl = `${baseUrl}/${lang}/payments/status?order_id={order_id}`;

        const requestBody = {
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
            order_tags: {
                plan: plan,
                userId: userId
            }
        };

        const response = await fetch(`${CASHFREE_API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID!,
                'x-client-secret': process.env.NEXT_PUBLIC_CASHFREE_SECRET_KEY!,
                'x-app-name': 'Telangana All Building Workers Union',
            },
            body: JSON.stringify(requestBody),
        });

        const orderResponse = await response.json() as any;

        if (response.ok && orderResponse?.payment_session_id) {
            const paymentData = {
                userId,
                plan,
                amount,
                status: 'pending',
                createdAt: serverTimestamp(),
                paymentDate: null,
                cf_order_id: orderResponse.order_id,
                cf_payment_id: null,
                order_meta: {
                    customer_name: user.name,
                    customer_phone: user.phone,
                    customer_email: user.email || `${user.phone}@tabu.local`,
                }
            };
            await addDoc(collection(db, "payments"), paymentData);

            return {
                success: true,
                payment_session_id: orderResponse.payment_session_id,
                order_id: orderResponse.order_id,
            };
        } else {
            console.error("Cashfree API response error:", orderResponse);
            const errorMessage = orderResponse?.message || 'Failed to create payment order.';
            return { success: false, error: errorMessage };
        }

    } catch (error: any) {
        console.error('Cashfree order creation error:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

export async function verifyPaymentAndUpdate(order_id: string) {
    try {
        if (!order_id || typeof order_id !== 'string') {
            return { success: false, status: 'INVALID_ORDER_ID', message: 'Invalid order ID provided.' };
        }

        console.log("Verifying payment for order:", order_id);

        const response = await fetch(`${CASHFREE_API_URL}/orders/${order_id}/payments`, {
            method: 'GET',
            headers: {
                'x-api-version': '2023-08-01',
                'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID!,
                'x-client-secret': process.env.NEXT_PUBLIC_CASHFREE_SECRET_KEY!,
            },
        });

        const transactions = await response.json() as any[];

        if (!response.ok) {
             if (response.status === 404) {
                return { success: false, status: 'ORDER_NOT_FOUND', message: 'Payment record not found with the gateway.' };
            }
            throw new Error((transactions as any).message || 'Failed to fetch payment status.');
        }
        
        let orderStatus: 'Success' | 'Pending' | 'Failure' = 'Failure';
        
        if (transactions.some((t: any) => t.payment_status === "SUCCESS")) {
            orderStatus = "Success";
        } else if (transactions.some((t: any) => t.payment_status === "PENDING")) {
            orderStatus = "Pending";
        }

        const paymentsQuery = query(collection(db, "payments"), where("cf_order_id", "==", order_id), limit(1));
        const querySnapshot = await getDocs(paymentsQuery);

        if (querySnapshot.empty) {
            return { success: false, status: 'NOT_FOUND', message: 'Payment record not found in our system. Please contact support.' };
        }
        
        const paymentDoc = querySnapshot.docs[0];
        const paymentData = paymentDoc.data();
        
        if (paymentData.status === 'success') {
            return { success: true, status: 'ALREADY_PROCESSED', message: 'Payment already verified and processed.' };
        }

        if (orderStatus === 'Success') {
            const batch = writeBatch(db);
            const successfulTx = transactions.find((t:any) => t.payment_status === 'SUCCESS');
            
            batch.update(paymentDoc.ref, {
                status: 'success',
                cf_payment_id: successfulTx.cf_payment_id || null,
                paymentDate: serverTimestamp(),
                gateway_response: {
                    payment_status: successfulTx.payment_status,
                    payment_method: successfulTx.payment_group,
                    bank_reference: successfulTx.bank_reference || null,
                },
                updatedAt: serverTimestamp(),
            });
            
            const userId = paymentData.userId;
            const plan = paymentData.plan;
            const userDocRef = doc(db, "users", userId);
            
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                throw new Error("User account not found during verification.");
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
            return { success: true, status: 'SUCCESS', message: 'Payment successful! Your subscription is now active.' };

        } else if (orderStatus === 'Pending') {
            return { success: false, status: 'PENDING', message: 'Payment is still being processed. We will check again.' };
        } else { // Failure
            const failedTx = transactions.length > 0 ? transactions[transactions.length - 1] : null;
            await updateDoc(paymentDoc.ref, {
                status: 'failed',
                gateway_response: {
                    payment_status: 'FAILED',
                    failure_reason: failedTx?.payment_message || 'Payment failed or was cancelled by the user.',
                },
                updatedAt: serverTimestamp(),
            });
            return { success: false, status: 'FAILED', message: failedTx?.payment_message || 'Payment failed or was cancelled.' };
        }

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return { success: false, status: 'ERROR', message: `Verification failed: ${error.message}.` };
    }
}
