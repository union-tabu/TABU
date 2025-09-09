
"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createCashfreeOrder } from '@/lib/cashfree';
import { useAuth } from '@/context/auth-context';

declare global {
  interface Window {
    Cashfree: any;
  }
}

interface PaymentButtonProps {
    plan: 'monthly' | 'yearly';
    amount: number;
    buttonText: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function PaymentButton({ plan, amount, buttonText, variant = "default" }: PaymentButtonProps) {
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string || 'en';
    const { toast } = useToast();
    const { firebaseUser, userData, loading: authLoading } = useAuth();
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const isTelugu = lang === 'te';
    const isHindi = lang === 'hi';

    const loadCashfreeScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (document.getElementById('cashfree-sdk')) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'cashfree-sdk';
            // Use the correct production URL for the Cashfree SDK
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.onload = () => {
                console.log("Cashfree SDK script loaded successfully.");
                resolve(true);
            };
            script.onerror = () => {
                console.error("Failed to load Cashfree SDK script.");
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };
    
    const handlePayment = async () => {
        console.log("Payment process started...");
        if (authLoading || !firebaseUser || !userData) {
            console.error("User data not loaded or user not authenticated.");
            toast({
                title: 'Please wait',
                description: 'User data is still loading. Please try again in a moment.',
                variant: 'destructive'
            });
            return;
        }
        
        setPaymentProcessing(true);

        console.log("User Data:", userData);
        console.log("Firebase User:", firebaseUser);

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

        console.log("Creating Cashfree order with options:", orderOptions);

        try {
            const orderResponse = await createCashfreeOrder(orderOptions);
            
            console.log("Received response from createCashfreeOrder:", orderResponse);

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
            const cashfree = new window.Cashfree(order.payment_session_id);

            cashfree.redirect();

        } catch (error: any) {
            console.error("Error during createCashfreeOrder call:", error);
            toast({ 
                title: 'Payment Error', 
                description: error.message || 'An unexpected error occurred while setting up the payment. Please try again.', 
                variant: 'destructive' 
            });
            setPaymentProcessing(false);
        }
    };

    let buttonLabel = buttonText;
    let processingLabel = 'Processing...';

    if (isHindi) {
        processingLabel = 'प्रोसेस हो रहा है...';
    } else if (isTelugu) {
        processingLabel = 'ప్రాసెస్ చేస్తోంది...';
    }

    if (authLoading) {
        return (
            <Button size="lg" className="w-full" disabled>
                {isHindi ? 'लोड हो रहा है...' : isTelugu ? 'లోడ్ అవుతోంది...' : 'Loading...'}
            </Button>
        );
    }
    
    return (
        <Button size="lg" className="w-full" onClick={handlePayment} disabled={paymentProcessing || authLoading}>
            {paymentProcessing ? processingLabel : buttonLabel}
        </Button>
    );
}
