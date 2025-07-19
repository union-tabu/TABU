// payment-button.tsx - Debug version
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder, handlePaymentSuccess } from '@/lib/razorpay';
import { useAuth } from '@/context/auth-context';
import type { UserData } from '@/app/dashboard/page';

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
            // Check if script is already loaded
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                console.log('Razorpay script loaded successfully');
                resolve(true);
            };
            script.onerror = () => {
                console.error('Failed to load Razorpay script');
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };
    
    const handlePayment = async () => {
        console.log('Payment initiated:', { plan, amount, authLoading });
        
        if (authLoading) {
            console.log('Auth still loading, returning early');
            return;
        }

        setPaymentProcessing(true);
        
        if (!firebaseUser || !userData) {
            console.log('User not authenticated, redirecting to signup');
            router.push(`${isTelugu ? '/te' : ''}/signup?plan=${plan}`);
            setPaymentProcessing(false);
            return;
        }

        console.log('User authenticated:', { 
            uid: firebaseUser.uid, 
            hasUserData: !!userData,
            userDataKeys: Object.keys(userData || {})
        });

        // Check if userData has required fields
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone) {
            console.error('Missing required user data:', {
                firstName: !!userData.firstName,
                lastName: !!userData.lastName,
                email: !!userData.email,
                phone: !!userData.phone
            });
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

        console.log('Creating Razorpay order with options:', {
            ...orderOptions,
            user: { ...orderOptions.user, phone: '[REDACTED]' }
        });

        try {
            const orderResponse = await createRazorpayOrder(orderOptions);
            console.log('Order response:', { success: orderResponse.success, hasOrder: !!orderResponse.order });

            if (!orderResponse.success || !orderResponse.order) {
                console.error('Order creation failed:', orderResponse.error);
                toast({ 
                    title: 'Payment Error', 
                    description: orderResponse.error || 'Could not create payment order.', 
                    variant: 'destructive' 
                });
                setPaymentProcessing(false);
                return;
            }

            const { order } = orderResponse;
            console.log('Order created successfully:', { 
                orderId: order.id, 
                amount: order.amount,
                currency: order.currency 
            });
            
            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "Sanghika Samakhya",
                description: `Membership - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                order_id: order.id,
                handler: async (response: any) => {
                    console.log('Payment handler called:', { 
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id 
                    });

                    try {
                        const paymentResult = await handlePaymentSuccess({
                            ...response,
                            userId: firebaseUser.uid,
                            plan,
                            amount
                        });

                        console.log('Payment success result:', paymentResult);

                        if (paymentResult.success) {
                            toast({ title: 'Payment Successful!', description: 'Your membership is now active.' });
                            router.push(isTelugu ? '/te/dashboard' : '/dashboard');
                        } else {
                            toast({ title: 'Payment Failed', description: paymentResult.error, variant: 'destructive' });
                        }
                    } catch (error) {
                        console.error('Error in payment handler:', error);
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
                        console.log('Payment modal dismissed');
                        setPaymentProcessing(false);
                    }
                }
            };

            console.log('Opening Razorpay with options:', {
                key: options.key?.substring(0, 10) + '...',
                amount: options.amount,
                order_id: options.order_id,
                prefill: { ...options.prefill, contact: '[REDACTED]' }
            });

            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', (response: any) => {
                console.error('Payment failed:', response.error);
                toast({ 
                    title: 'Payment Failed', 
                    description: response.error?.description || 'Payment failed', 
                    variant: 'destructive' 
                });
                setPaymentProcessing(false);
            });

            rzp.open();

        } catch (error) {
            console.error('Error in handlePayment:', error);
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