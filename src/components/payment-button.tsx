
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createCashfreeOrder } from '@/lib/cashfree';
import { useAuth } from '@/context/auth-context';
import { load } from '@cashfreepayments/cashfree-js';

interface PaymentButtonProps {
    plan: 'monthly' | 'yearly';
    amount: number;
    buttonText: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
}

export function PaymentButton({ 
    plan, 
    amount, 
    buttonText, 
    variant = "default",
    className = ""
}: PaymentButtonProps) {
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string || 'en';
    const { toast } = useToast();
    const { firebaseUser, userData, loading: authLoading } = useAuth();
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [cashfree, setCashfree] = useState<any>(null);

    const isTelugu = lang === 'te';
    const isHindi = lang === 'hi';

    useEffect(() => {
        const initializeSDK = async () => {
            try {
                const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'production';
                const sdk = await load({
                    mode: isProduction ? "production" : "sandbox"
                });
                setCashfree(sdk);
                console.log('Cashfree SDK initialized.');
            } catch (error) {
                console.error("Cashfree SDK initialization error:", error);
                toast({
                    title: "Payment Gateway Error",
                    description: "Could not initialize the payment gateway. Please refresh the page.",
                    variant: 'destructive'
                });
            }
        };

        initializeSDK();
    }, [toast]);

    const handlePayment = useCallback(async () => {
        if (paymentProcessing) return;

        if (!cashfree) {
            toast({
                title: "Payment Gateway Not Ready",
                description: "The payment gateway is still initializing. Please wait a moment.",
                variant: 'destructive'
            });
            return;
        }

        if (authLoading || !firebaseUser || !userData) {
            toast({
                title: "Authentication Error",
                description: "User data not loaded. Please wait or try logging in again.",
                variant: 'destructive'
            });
            return;
        }
        
        if (!userData.fullName?.trim() || !userData.phone?.trim()) {
            toast({ 
                title: 'Profile Incomplete', 
                description: 'Please complete your profile before making a payment.', 
                variant: 'destructive' 
            });
            router.push(`/${lang}/profile`);
            return;
        }

        setPaymentProcessing(true);

        try {
            const orderResponse = await createCashfreeOrder({
                amount,
                plan,
                userId: firebaseUser.uid,
                user: {
                    name: userData.fullName.trim(),
                    phone: userData.phone.trim(),
                    email: userData.email?.trim() || '',
                },
            });

            if (!orderResponse.success || !orderResponse.payment_session_id) {
                toast({
                    title: "Payment Error",
                    description: orderResponse.error || "Failed to create a payment session.",
                    variant: 'destructive'
                });
                setPaymentProcessing(false);
                return;
            }

            const checkoutOptions = {
                paymentSessionId: orderResponse.payment_session_id,
                redirectTarget: "_modal"
            };
            
            cashfree.checkout(checkoutOptions).then((result: any) => {
                if (result.error) {
                    console.log("User has closed the popup or there is some payment error, Check for Payment Status", result.error);
                    router.push(`/${lang}/payments/status?order_id=${orderResponse.order_id}`);
                }
                if (result.paymentDetails) {
                    console.log("Payment has been completed, Check for Payment Status");
                    router.push(`/${lang}/payments/status?order_id=${orderResponse.order_id}`);
                }
            });
            
        } catch (error: any) {
            console.error('Payment initiation error:', error);
            toast({
                title: "Payment Initialization Failed",
                description: error.message || 'Could not launch the payment gateway.',
                variant: 'destructive'
            });
        } finally {
            setPaymentProcessing(false);
        }
    }, [
        paymentProcessing, cashfree, authLoading, firebaseUser, userData,
        amount, plan, router, toast, lang
    ]);
    
    const getButtonText = () => {
        if (authLoading) {
            return isHindi ? 'लोड हो रहा है...' : isTelugu ? 'లోడ్ అవుతోంది...' : 'Loading...';
        }
        if (paymentProcessing) {
            return isHindi ? 'प्रतीक्षा करें...' : isTelugu ? 'వేచి ఉండండి...' : 'Please wait...';
        }
        if (!cashfree) {
            return isHindi ? 'गेटवे लोड हो रहा है...' : isTelugu ? 'గేట్‌వే లోడ్ అవుతోంది...' : 'Loading Gateway...';
        }
        return buttonText;
    };

    const isDisabled = authLoading || paymentProcessing || !cashfree;

    return (
        <Button
            size="lg"
            className={`w-full ${className}`}
            variant={variant}
            onClick={handlePayment}
            disabled={isDisabled}
        >
            {getButtonText()}
        </Button>
    );
}
