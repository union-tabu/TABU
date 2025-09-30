
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createCashfreeOrder } from '@/lib/cashfree';
import { useAuth } from '@/context/auth-context';

declare const Cashfree: any;

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
    const [isCashfreeReady, setIsCashfreeReady] = useState(false);

    const isTelugu = lang === 'te';
    const isHindi = lang === 'hi';

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.onload = () => {
            console.log('Cashfree SDK loaded.');
            setIsCashfreeReady(true);
        };
        script.onerror = () => {
            console.error('Failed to load Cashfree SDK.');
            toast({
                title: "Payment Gateway Error",
                description: "Could not load payment gateway. Please check your connection and try again.",
                variant: 'destructive'
            });
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, [toast]);

    const handlePayment = useCallback(async () => {
        if (paymentProcessing) return;

        if (!isCashfreeReady) {
            toast({
                title: "Payment Gateway Loading",
                description: "The payment gateway is still loading, please wait a moment.",
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

            const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'production';
            const cashfree = new Cashfree({
                mode: isProduction ? "production" : "sandbox"
            });
            
            cashfree.checkout({
                paymentSessionId: orderResponse.payment_session_id,
                returnUrl: `/${lang}/payments/status?order_id=${orderResponse.order_id}`,
                onSuccess: (data: any) => {
                     if (data && data.order && data.order.orderId) {
                        router.push(`/${lang}/payments/status?order_id=${data.order.orderId}`);
                    }
                },
                onFailure: (data: any) => {
                     if (data && data.order && data.order.orderId) {
                        router.push(`/${lang}/payments/status?order_id=${data.order.orderId}`);
                    }
                },
                onPrimary: (data: any) => {
                  console.log('primary', data);
                },
                onSecondary: (data: any) => {
                  console.log('secondary', data);
                },
                onExit: (data: any) => {
                  console.log('exit', data);
                },
            });

            setPaymentProcessing(false);
            
        } catch (error: any) {
            console.error('Payment initiation error:', error);
            toast({
                title: "Payment Initialization Failed",
                description: error.message || 'Could not launch the payment gateway.',
                variant: 'destructive'
            });
            setPaymentProcessing(false);
        }
    }, [
        paymentProcessing, isCashfreeReady, authLoading, firebaseUser, userData,
        amount, plan, router, toast, lang
    ]);
    
    const getButtonText = () => {
        if (authLoading) {
            return isHindi ? 'लोड हो रहा है...' : isTelugu ? 'లోడ్ అవుతోంది...' : 'Loading...';
        }
        if (paymentProcessing) {
            return isHindi ? 'प्रतीक्षा करें...' : isTelugu ? 'వేచి ఉండండి...' : 'Please wait...';
        }
        if (!isCashfreeReady) {
            return isHindi ? 'गेटवे लोड हो रहा है...' : isTelugu ? 'గేట్‌వే లోడ్ అవుతోంది...' : 'Loading Gateway...';
        }
        return buttonText;
    };

    const isDisabled = authLoading || paymentProcessing || !isCashfreeReady;

    return (
        <>
            <div id="payment-form"></div>
            <Button
                size="lg"
                className={`w-full ${className}`}
                variant={variant}
                onClick={handlePayment}
                disabled={isDisabled}
            >
                {getButtonText()}
            </Button>
        </>
    );
}
