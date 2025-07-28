
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder, handlePaymentSuccess } from '@/lib/razorpay';
import { useAuth } from '@/context/auth-context';
import type { UserData } from '@/types/user';

declare global {
  interface Window {
    Razorpay: any;
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
    const pathname = usePathname();
    const { toast } = useToast();
    const { firebaseUser, userData, loading: authLoading } = useAuth();
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const isTelugu = pathname.startsWith('/te');

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };
    
    const handlePayment = async () => {
        if (authLoading) {
            return;
        }

        setPaymentProcessing(true);
        
        if (!firebaseUser || !userData) {
            router.push(`${isTelugu ? '/te' : ''}/signup?plan=${plan}`);
            setPaymentProcessing(false);
            return;
        }

        if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone) {
            toast({ 
                title: 'Profile Incomplete', 
                description: 'Please complete your profile before making a payment.', 
                variant: 'destructive' 
            });
            setPaymentProcessing(false);
            return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast({ title: 'Error', description: 'Could not load payment gateway.', variant: 'destructive' });
            setPaymentProcessing(false);
            return;
        }

        const orderOptions = {
            amount,
            plan,
            userId: firebaseUser.uid,
            user: {
                name: `${userData.firstName} ${userData.lastName}`.trim(),
                email: userData.email,
                phone: userData.phone,
            },
        };

        try {
            const orderResponse = await createRazorpayOrder(orderOptions);

            if (!orderResponse.success || !orderResponse.order) {
                toast({ 
                    title: 'Payment Error', 
                    description: orderResponse.error || 'Could not create payment order.', 
                    variant: 'destructive' 
                });
                setPaymentProcessing(false);
                return;
            }

            const { order } = orderResponse;
            
            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "Sanghika Samakhya",
                description: `Membership - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const paymentResult = await handlePaymentSuccess({
                            ...response,
                            userId: firebaseUser.uid,
                            plan,
                            amount
                        });

                        if (paymentResult.success) {
                            toast({ title: 'Payment Successful!', description: 'Your membership is now active.' });
                            router.push(isTelugu ? '/te/dashboard' : '/dashboard');
                        } else {
                            toast({ title: 'Payment Failed', description: paymentResult.error, variant: 'destructive' });
                        }
                    } catch (error) {
                        toast({ title: 'Payment Error', description: 'Failed to process payment', variant: 'destructive' });
                    }
                    setPaymentProcessing(false);
                },
                prefill: {
                    name: order.userName,
                    email: order.userEmail,
                    contact: order.userPhone,
                },
                notes: {
                    address: userData.address || 'Not provided',
                },
                theme: {
                    color: "#FF9900"
                },
                modal: {
                    ondismiss: () => {
                        setPaymentProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', (response: any) => {
                toast({ 
                    title: 'Payment Failed', 
                    description: response.error?.description || 'Payment failed', 
                    variant: 'destructive' 
                });
                setPaymentProcessing(false);
            });

            rzp.open();

        } catch (error) {
            toast({ 
                title: 'Payment Error', 
                description: 'An unexpected error occurred. Please try again.', 
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
            {paymentProcessing ? 'Processing...' : (firebaseUser ? buttonText : (isTelugu ? 'చెల్లించడానికి సైన్ అప్ చేయండి' : 'Sign up to Pay'))}
        </Button>
    );
}
