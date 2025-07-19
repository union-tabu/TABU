
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createRazorpayOrder, handlePaymentSuccess } from '@/lib/razorpay';
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
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const isTelugu = pathname.startsWith('/te');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setFirebaseUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);
                }
            } else {
                setFirebaseUser(null);
                setUserData(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    
    const handlePayment = async () => {
        setPaymentProcessing(true);
        if (!firebaseUser || !userData) {
            router.push(`${isTelugu ? '/te' : ''}/signup?plan=${plan}`);
            return;
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast({ title: 'Error', description: 'Could not load payment gateway.', variant: 'destructive' });
            setPaymentProcessing(false);
            return;
        }

        const orderResponse = await createRazorpayOrder({
            amount,
            plan,
            userId: firebaseUser.uid,
            user: {
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                phone: userData.phone,
            },
        });

        if (!orderResponse.success || !orderResponse.order) {
            toast({ title: 'Error', description: orderResponse.error || 'Could not create payment order.', variant: 'destructive' });
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
                setPaymentProcessing(false);
            },
            prefill: {
                name: order.userName,
                email: order.userEmail,
                contact: order.userPhone,
            },
            notes: {
                address: userData.address,
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
             toast({ title: 'Payment Failed', description: response.error.description, variant: 'destructive' });
             setPaymentProcessing(false);
        });

        rzp.open();
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
