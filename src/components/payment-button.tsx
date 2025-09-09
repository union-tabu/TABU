
"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createCashfreeOrder } from '@/lib/cashfree';
import { useAuth } from '@/context/auth-context';

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
    
    const handlePayment = async () => {
        if (authLoading || !firebaseUser || !userData) {
            toast({
                title: isHindi ? 'कृपया प्रतीक्षा करें' : isTelugu ? 'దయచేసి వేచి ఉండండి' : 'Please wait',
                description: isHindi ? 'उपयोगकर्ता डेटा अभी भी लोड हो रहा है। कृपया कुछ क्षण बाद पुनः प्रयास करें।' : isTelugu ? 'వినియోగదారు డేటా ఇప్పటికీ లోడ్ అవుతోంది. దయచేసి కొంత సమయం తర్వాత మళ్లీ ప్రయత్నించండి.' : 'User data is still loading. Please try again in a moment.',
                variant: 'destructive'
            });
            return;
        }
        
        setPaymentProcessing(true);

        if (!userData.fullName || !userData.phone) {
            toast({ 
                title: isHindi ? 'प्रोफ़ाइल अपूर्ण' : isTelugu ? 'ప్రొఫైల్ అసంపూర్తిగా ఉంది' : 'Profile Incomplete', 
                description: isHindi ? 'भुगतान करने से पहले कृपया अपना प्रोफ़ाइल पूरा करें।' : isTelugu ? 'చెల్లింపు చేయడానికి ముందు దయచేసి మీ ప్రొఫైల్‌ను పూర్తి చేయండి.' : 'Please complete your profile before making a payment.', 
                variant: 'destructive' 
            });
            router.push(`/${lang}/profile`);
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

            if (!orderResponse.success || !orderResponse.payment_link) {
                toast({ 
                    title: isHindi ? 'भुगतान त्रुटि' : isTelugu ? 'చెల్లింపు లోపం' : 'Payment Error', 
                    description: orderResponse.error || (isHindi ? 'भुगतान ऑर्डर बनाने में विफल। कृपया पुनः प्रयास करें।' : isTelugu ? 'చెల్లింపు ఆర్డర్‌ను సృష్టించడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Could not create a payment order. Please try again.'), 
                    variant: 'destructive' 
                });
                setPaymentProcessing(false);
                return;
            }
            
            // Redirect user to the payment page
            router.push(orderResponse.payment_link);

        } catch (error: any) {
            toast({ 
                title: isHindi ? 'भुगतान त्रुटि' : isTelugu ? 'చెల్లింపు లోపం' : 'Payment Error', 
                description: error.message || (isHindi ? 'भुगतान सेट अप करते समय एक अप्रत्याशित त्रुटि हुई।' : isTelugu ? 'చెల్లింపును సెటప్ చేస్తున్నప్పుడు ఊహించని లోపం సంభవించింది.' : 'An unexpected error occurred while setting up the payment.'), 
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
