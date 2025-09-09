"use client";

import { useState, useCallback } from 'react';
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

    const isTelugu = lang === 'te';
    const isHindi = lang === 'hi';
    
    // Validate inputs
    const isValidAmount = typeof amount === 'number' && amount > 0;
    const isValidPlan = plan === 'monthly' || plan === 'yearly';
    
    const handlePayment = useCallback(async () => {
        // Prevent double clicks
        if (paymentProcessing) {
            return;
        }

        // Validation checks
        if (!isValidAmount || !isValidPlan) {
            toast({
                title: isHindi ? 'अमान्य डेटा' : isTelugu ? 'చెల్లని డేటా' : 'Invalid Data',
                description: isHindi ? 'भुगतान की जानकारी गलत है।' : isTelugu ? 'చెల్లింపు సమాచారం తప్పు.' : 'Payment information is invalid.',
                variant: 'destructive'
            });
            return;
        }

        if (authLoading) {
            toast({
                title: isHindi ? 'कृपया प्रतीक्षा करें' : isTelugu ? 'దయచేసి వేచి ఉండండి' : 'Please wait',
                description: isHindi ? 'उपयोगकर्ता डेटा अभी भी लोड हो रहा है।' : isTelugu ? 'వినియోగదారు డేటా ఇప్పటికీ లోడ్ అవుతోంది.' : 'User data is still loading.',
                variant: 'destructive'
            });
            return;
        }

        if (!firebaseUser) {
            toast({
                title: isHindi ? 'लॉग इन करें' : isTelugu ? 'లాగిన్ చేయండి' : 'Please log in',
                description: isHindi ? 'भुगतान करने से पहले कृपया लॉग इन करें।' : isTelugu ? 'చెల్లింపు చేయడానికి ముందు దయచేసి లాగిన్ చేయండి.' : 'Please log in before making a payment.',
                variant: 'destructive'
            });
            router.push(`/${lang}/login`);
            return;
        }

        if (!userData) {
            toast({
                title: isHindi ? 'उपयोगकर्ता डेटा नहीं मिला' : isTelugu ? 'వినియోగదారు డేటా కనుగొనబడలేదు' : 'User data not found',
                description: isHindi ? 'कृपया दोबारा लॉग इन करने का प्रयास करें।' : isTelugu ? 'దయచేసి మళ్లీ లాగిన్ చేయడానికి ప్రయత్నించండి.' : 'Please try logging in again.',
                variant: 'destructive'
            });
            return;
        }
        
        // Check required profile fields
        if (!userData.fullName?.trim() || !userData.phone?.trim()) {
            toast({ 
                title: isHindi ? 'प्रोफ़ाइल अपूर्ण' : isTelugu ? 'ప్రొఫైల్ అసంపూర్తిగా ఉంది' : 'Profile Incomplete', 
                description: isHindi ? 'भुगतान करने से पहले कृपया अपना प्रोफ़ाइल पूरा करें।' : isTelugu ? 'చెల్లింపు చేయడానికి ముందు దయచేసి మీ ప్రొఫైల్‌ను పూర్తి చేయండి.' : 'Please complete your profile before making a payment.', 
                variant: 'destructive' 
            });
            router.push(`/${lang}/profile`);
            return;
        }
        
        // Validate phone number format
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(userData.phone)) {
            toast({
                title: isHindi ? 'गलत फोन नंबर' : isTelugu ? 'తప్పు ఫోన్ నంబర్' : 'Invalid Phone Number',
                description: isHindi ? 'कृपया एक मान्य भारतीय फोन नंबर प्रदान करें।' : isTelugu ? 'దయచేసి చెల్లుబాటు అయ్యే భారతీయ ఫోన్ నంబర్‌ను అందించండి.' : 'Please provide a valid Indian phone number.',
                variant: 'destructive'
            });
            router.push(`/${lang}/profile`);
            return;
        }

        setPaymentProcessing(true);

        const orderOptions = {
            amount,
            plan,
            userId: firebaseUser.uid,
            user: {
                name: userData.fullName.trim(),
                phone: userData.phone.trim(),
                email: userData.email?.trim() || '',
            },
        };

        try {
            console.log('Creating payment order:', { plan, amount, userId: firebaseUser.uid });
            
            const orderResponse = await createCashfreeOrder(orderOptions);

            if (!orderResponse.success) {
                console.error('Order creation failed:', orderResponse.error);
                toast({ 
                    title: isHindi ? 'भुगतान त्रुटि' : isTelugu ? 'చెల్లింపు లోపం' : 'Payment Error', 
                    description: orderResponse.error || (
                        isHindi ? 'भुगतान ऑर्डर बनाने में विफल। कृपया पुनः प्रयास करें।' : 
                        isTelugu ? 'చెల్లింపు ఆర్డర్‌ను సృష్టించడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 
                        'Failed to create payment order. Please try again.'
                    ), 
                    variant: 'destructive' 
                });
                return;
            }

            if (!orderResponse.payment_link) {
                console.error('No payment link in response:', orderResponse);
                toast({ 
                    title: isHindi ? 'भुगतान त्रुटि' : isTelugu ? 'చెల్లింపు లోపం' : 'Payment Error', 
                    description: isHindi ? 'भुगतान लिंक प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।' : 
                        isTelugu ? 'చెల్లింపు లింక్ రాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.' : 
                        'Payment link not received. Please try again.', 
                    variant: 'destructive' 
                });
                return;
            }
            
            console.log('Payment link received, redirecting:', orderResponse.payment_link);
            
            // Show success message before redirect
            toast({
                title: isHindi ? 'भुगतान पेज पर जा रहे हैं' : isTelugu ? 'చెల్లింపు పేజీకి వెళ్తోంది' : 'Redirecting to Payment',
                description: isHindi ? 'कृपया भुगतान पूरा करने के लिए प्रतीक्षा करें।' : 
                    isTelugu ? 'చెల్లింపు పూర్తి చేయడానికి దయచేసి వేచి ఉండండి.' : 
                    'Please wait while we redirect you to complete payment.',
                variant: 'default'
            });

            // Small delay to ensure toast is shown
            setTimeout(() => {
                window.location.href = orderResponse.payment_link!;
            }, 1000);

        } catch (error: any) {
            console.error('Payment setup error:', error);
            toast({ 
                title: isHindi ? 'भुगतान त्रुटि' : isTelugu ? 'చెల్లింపు లోపం' : 'Payment Error', 
                description: error.message || (
                    isHindi ? 'भुगतान सेट अप करते समय एक अप्रत्याशित त्रुटि हुई।' : 
                    isTelugu ? 'చెల్లింపును సెటప్ చేస్తున్నప్పుడు ఊహించని లోపం సంభవించింది.' : 
                    'An unexpected error occurred while setting up the payment.'
                ), 
                variant: 'destructive' 
            });
        } finally {
            setPaymentProcessing(false);
        }
    }, [
        paymentProcessing, isValidAmount, isValidPlan, authLoading, firebaseUser, 
        userData, amount, plan, router, toast, isHindi, isTelugu, lang
    ]);

    // Determine button text based on state and language
    const getButtonText = () => {
        if (authLoading) {
            return isHindi ? 'लोड हो रहा है...' : isTelugu ? 'లోడ్ అవుతోంది...' : 'Loading...';
        }
        
        if (paymentProcessing) {
            return isHindi ? 'प्रोसेस हो रहा है...' : isTelugu ? 'ప్రాసెస్ చేస్తోంది...' : 'Processing...';
        }
        
        return buttonText;
    };

    const isDisabled = authLoading || paymentProcessing || !isValidAmount || !isValidPlan;
    
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


// "use client";

// import { useState } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';
// import { createCashfreeOrder } from '@/lib/cashfree';
// import { useAuth } from '@/context/auth-context';

// interface PaymentButtonProps {
//     plan: 'monthly' | 'yearly';
//     amount: number;
//     buttonText: string;
//     variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
// }

// export function PaymentButton({ plan, amount, buttonText, variant = "default" }: PaymentButtonProps) {
//     const router = useRouter();
//     const params = useParams();
//     const lang = params.lang as string || 'en';
//     const { toast } = useToast();
//     const { firebaseUser, userData, loading: authLoading } = useAuth();
//     const [paymentProcessing, setPaymentProcessing] = useState(false);

//     const isTelugu = lang === 'te';
//     const isHindi = lang === 'hi';
    
//     const handlePayment = async () => {
//         if (authLoading || !firebaseUser || !userData) {
//             toast({
//                 title: isHindi ? 'कृपया प्रतीक्षा करें' : isTelugu ? 'దయచేసి వేచి ఉండండి' : 'Please wait',
//                 description: isHindi ? 'उपयोगकर्ता डेटा अभी भी लोड हो रहा है। कृपया कुछ क्षण बाद पुनः प्रयास करें।' : isTelugu ? 'వినియోగదారు డేటా ఇప్పటికీ లోడ్ అవుతోంది. దయచేసి కొంత సమయం తర్వాత మళ్లీ ప్రయత్నించండి.' : 'User data is still loading. Please try again in a moment.',
//                 variant: 'destructive'
//             });
//             return;
//         }
        
//         setPaymentProcessing(true);

//         if (!userData.fullName || !userData.phone) {
//             toast({ 
//                 title: isHindi ? 'प्रोफ़ाइल अपूर्ण' : isTelugu ? 'ప్రొఫైల్ అసంపూర్తిగా ఉంది' : 'Profile Incomplete', 
//                 description: isHindi ? 'भुगतान करने से पहले कृपया अपना प्रोफ़ाइल पूरा करें।' : isTelugu ? 'చెల్లింపు చేయడానికి ముందు దయచేసి మీ ప్రొఫైల్‌ను పూర్తి చేయండి.' : 'Please complete your profile before making a payment.', 
//                 variant: 'destructive' 
//             });
//             router.push(`/${lang}/profile`);
//             setPaymentProcessing(false);
//             return;
//         }
        
//         const orderOptions = {
//             amount,
//             plan,
//             userId: firebaseUser.uid,
//             user: {
//                 name: userData.fullName,
//                 phone: userData.phone,
//                 email: userData.email || '',
//             },
//         };

//         try {
//             const orderResponse = await createCashfreeOrder(orderOptions);

//             if (!orderResponse.success || !orderResponse.payment_link) {
//                 toast({ 
//                     title: isHindi ? 'भुगतान त्रुटि' : isTelugu ? 'చెల్లింపు లోపం' : 'Payment Error', 
//                     description: orderResponse.error || (isHindi ? 'भुगतान ऑर्डर बनाने में विफल। कृपया पुनः प्रयास करें।' : isTelugu ? 'చెల్లింపు ఆర్డర్‌ను సృష్టించడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Could not create a payment order. Please try again.'), 
//                     variant: 'destructive' 
//                 });
//                 setPaymentProcessing(false);
//                 return;
//             }
            
//             // Redirect user to the payment page
//             router.push(orderResponse.payment_link);

//         } catch (error: any) {
//             toast({ 
//                 title: isHindi ? 'भुगतान त्रुटि' : isTelugu ? 'చెల్లింపు లోపం' : 'Payment Error', 
//                 description: error.message || (isHindi ? 'भुगतान सेट अप करते समय एक अप्रत्याशित त्रुटि हुई।' : isTelugu ? 'చెల్లింపును సెటప్ చేస్తున్నప్పుడు ఊహించని లోపం సంభవించింది.' : 'An unexpected error occurred while setting up the payment.'), 
//                 variant: 'destructive' 
//             });
//             setPaymentProcessing(false);
//         }
//     };

//     let buttonLabel = buttonText;
//     let processingLabel = 'Processing...';

//     if (isHindi) {
//         processingLabel = 'प्रोसेस हो रहा है...';
//     } else if (isTelugu) {
//         processingLabel = 'ప్రాసెస్ చేస్తోంది...';
//     }

//     if (authLoading) {
//         return (
//             <Button size="lg" className="w-full" disabled>
//                 {isHindi ? 'लोड हो रहा है...' : isTelugu ? 'లోడ్ అవుతోంది...' : 'Loading...'}
//             </Button>
//         );
//     }
    
//     return (
//         <Button size="lg" className="w-full" onClick={handlePayment} disabled={paymentProcessing || authLoading}>
//             {paymentProcessing ? processingLabel : buttonLabel}
//         </Button>
//     );
// }
