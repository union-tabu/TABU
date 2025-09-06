
"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createCashfreeOrder, handlePaymentSuccess } from '@/lib/cashfree';
import { useAuth } from '@/context/auth-context';

declare global {
  interface Window {
    cashfree: any;
  }
}

interface PaymentButtonProps {
    plan: 'monthly' | 'yearly';
    amount: number;
    buttonText: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "accent";
}

export function PaymentButton({ plan, amount, buttonText, variant = "default" }: PaymentButtonProps) {
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string;
    const { toast } = useToast();
    const { firebaseUser, userData, loading: authLoading } = useAuth();
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const isTelugu = lang === 'te';

    const loadCashfreeScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById('cashfree-sdk')) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'cashfree-sdk';
            script.src = process.env.NODE_ENV === 'production' 
                ? 'https://sdk.cashfree.com/js/v3/cashfree.js' 
                : 'https://sdk.cashfree.com/js/v3/cashfree-sandbox.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    
    const handlePayment = async () => {
        if (authLoading) return;
        setPaymentProcessing(true);
        
        if (!firebaseUser || !userData) {
            router.push(`/${lang}/signup?plan=${plan}`);
            setPaymentProcessing(false);
            return;
        }

        if (!userData.fullName || !userData.phone || !userData.addressLine || !userData.city) {
            toast({ 
                title: 'Profile Incomplete', 
                description: 'Please complete your profile with your name, phone, and address before making a payment.', 
                variant: 'destructive' 
            });
             router.push(`/${lang}/profile`);
            setPaymentProcessing(false);
            return;
        }

        const scriptLoaded = await loadCashfreeScript();
        if (!scriptLoaded) {
            toast({ title: 'Payment Gateway Error', description: 'Could not load the payment gateway. Please check your internet connection and try again.', variant: 'destructive' });
            setPaymentProcessing(false);
            return;
        }

        const orderOptions = {
            amount,
            plan,
            userId: firebaseUser.uid,
            user: {
                name: userData.fullName,
                phone: userData.phone,
                email: userData.email || '',
            },
        };

        try {
            const orderResponse = await createCashfreeOrder(orderOptions);

            if (!orderResponse.success || !orderResponse.order) {
                toast({ 
                    title: 'Payment Error', 
                    description: orderResponse.error || 'Could not create a payment order. Please try again.', 
                    variant: 'destructive' 
                });
                setPaymentProcessing(false);
                return;
            }

            const { order } = orderResponse;
            const cashfree = new window.cashfree.Cashfree(order.payment_session_id);

            cashfree.redirect();

        } catch (error) {
            toast({ 
                title: 'Payment Error', 
                description: 'An unexpected error occurred while setting up the payment. Please try again.', 
                variant: 'destructive' 
            });
            setPaymentProcessing(false);
        }
    };

    const buttonClass = variant === 'accent'
        ? "w-full bg-accent text-accent-foreground hover:bg-accent/90"
        : "w-full bg-primary text-primary-foreground hover:bg-primary/90";

    if (authLoading) {
         return (
            <Button size="lg" className={buttonClass} disabled>
                Loading...
            </Button>
        );
    }

    return (
        <Button size="lg" className={buttonClass} onClick={handlePayment} disabled={paymentProcessing}>
            {paymentProcessing ? (isTelugu ? 'ప్రాసెస్ చేస్తోంది...' : 'Processing...') : (firebaseUser ? buttonText : (isTelugu ? 'చెల్లించడానికి సైన్ అప్ చేయండి' : 'Sign up to Pay'))}
        </Button>
    );
}
