
'use server';

import { Cashfree } from 'cashfree-pg';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, limit, getDoc } from "firebase/firestore";
import { startOfMonth, addMonths, addYears } from 'date-fns';

if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    throw new Error("Cashfree credentials (CASHFREE_APP_ID, CASHFREE_SECRET_KEY) are not set in environment variables.");
}

const isProduction = process.env.CASHFREE_ENVIRONMENT === 'production';
const cashfree = new Cashfree({
    mode: isProduction ? 'production' : 'sandbox',
    api_key: process.env.CASHFREE_APP_ID,
    api_secret: process.env.CASHFREE_SECRET_KEY,
});

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
        
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            return { 
                success: false, 
                error: "User not found. Please log in again." 
            };
        }

        const orderId = `TABU_${userId.substring(0, 8)}_${Date.now()}`;
        
        const lang = 'en'; // The return URL can be language-agnostic
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');
        const returnUrl = `${baseUrl}/${lang}/payments/status?order_id={order_id}`;

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
            order_tags: {
                plan: plan,
                userId: userId
            }
        };

        const order = await cashfree.PGCreateOrder("2023-08-01", request);

        if (!order.data || !order.data.payment_session_id) {
            console.error("Cashfree API response error (missing data or payment_session_id):", order.data);
            return { 
                success: false, 
                error: "Failed to create payment order. Response from gateway was incomplete." 
            };
        }
        
        const paymentSessionId = order.data.payment_session_id;

        const paymentData = {
            userId,
            plan,
            amount,
            status: 'pending',
            createdAt: serverTimestamp(),
            paymentDate: null,
            cf_order_id: order.data.order_id,
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
            payment_session_id: paymentSessionId,
            order_id: order.data.order_id,
        };

    } catch (error: any) {
        console.error('Cashfree order creation error:', error);
        
        if (error.response?.data) {
            const cfError = error.response.data;
            console.error('Cashfree API Error Details:', cfError);
            
            if (cfError.type === 'authentication_error') {
                 return { 
                    success: false, 
                    error: 'Payment service configuration error. Please contact support.' 
                };
            }
             if (cfError.type === 'invalid_request_error') {
                return { 
                    success: false, 
                    error: `Invalid request: ${cfError.message || 'Please check your payment details.'}` 
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

        let orderDetails;
        try {
            orderDetails = await cashfree.PGGetOrderById("2023-08-01", order_id);
        } catch (cfError: any) {
            console.error("Cashfree API error while verifying:", cfError);
            
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
        
        if (paymentData.status === 'success') {
            console.log("Payment already processed:", order_id);
            return { 
                success: true, 
                status: 'ALREADY_PROCESSED', 
                message: 'Payment already verified and processed.' 
            };
        }

        if (paymentInfo.order_status === 'PAID') {
            const batch = writeBatch(db);
            
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
            
            const userId = paymentData.userId;
            const plan = paymentData.plan;
            const userDocRef = doc(db, "users", userId);
            
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
            return { 
                success: false, 
                status: 'PENDING', 
                message: 'Payment is still being processed. Please wait a moment and check again.' 
            };

        } else if (['FAILED', 'CANCELLED', 'TERMINATED'].includes(paymentInfo.order_status)) {
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
