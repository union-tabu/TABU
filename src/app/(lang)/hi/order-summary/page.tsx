
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Suspense, useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { PaymentButton } from "@/components/payment-button";
import { differenceInMonths, startOfMonth } from 'date-fns';
import { CashfreeMonthlyButton } from "@/components/cashfree-monthly-button";

type PlanType = 'monthly' | 'yearly';

interface PlanDetails {
    plan: PlanType;
    basePrice: number;
    penalty: number;
    amount: number;
    isLapsed: boolean;
}

function OrderSummaryContentHi() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userData, loading: authLoading } = useAuth();

    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const PENALTY_FEE = 500;
    const MONTHLY_PRICE = 100;
    const YEARLY_PRICE = 1200;
    const planMap: { [key: string]: string } = { 'monthly': 'मासिक', 'yearly': 'वार्षिक' };

    const planParam = useMemo(() => {
        const param = searchParams.get('plan');
        return param && ['monthly', 'yearly'].includes(param) ? param as PlanType : null;
    }, [searchParams]);

    useEffect(() => {
        if (!planParam) {
            setError('अमान्य योजना चुनी गई');
            setTimeout(() => {
                router.replace('/hi/subscribe');
            }, 2000);
            return;
        }

        if (authLoading) return;

        try {
            let isLapsed = false;
            let penalty = 0;

            if (userData?.subscription?.status === 'pending') {
                const now = new Date();
                const gracePeriodStartDate = userData.subscription?.renewalDate
                    ? new Date(userData.subscription.renewalDate.seconds * 1000)
                    : new Date(userData.createdAt.seconds * 1000);
                
                if (differenceInMonths(startOfMonth(now), startOfMonth(gracePeriodStartDate)) >= 2) {
                    isLapsed = true;
                    penalty = PENALTY_FEE;
                }
            }
            
            const basePrice = planParam === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
            const totalAmount = basePrice + penalty;

            setPlanDetails({ plan: planParam, basePrice, penalty, amount: totalAmount, isLapsed });
            setError(null);
        } catch (err) {
            console.error('मूल्य निर्धारण विवरण की गणना में त्रुटि:', err);
            setError('मूल्य निर्धारण की गणना करने में विफल। कृपया पुनः प्रयास करें।');
        } finally {
            setLoading(false);
        }
    }, [planParam, authLoading, userData, router]);

    if (loading || authLoading) {
        return (
            <div className="mx-auto w-full max-w-lg">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Card><CardHeader><Skeleton className="h-8 w-1/2 mb-2" /><Skeleton className="h-4 w-full" /></CardHeader><CardContent className="space-y-4"><div className="flex justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/3" /></div><div className="flex justify-between"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-1/4" /></div><Skeleton className="h-px w-full" /><div className="flex justify-between"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-6 w-1/3" /></div></CardContent><CardFooter><Skeleton className="h-12 w-full" /></CardFooter></Card>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="mx-auto w-full max-w-lg">
                <Card className="border-destructive"><CardHeader className="text-center"><AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" /><CardTitle className="text-destructive">त्रुटि</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardFooter><Button asChild className="w-full"><Link href="/hi/subscribe">योजनाओं पर वापस जाएं</Link></Button></CardFooter></Card>
            </div>
        );
    }

    if (!planDetails) return null;

    const { plan, basePrice, penalty, amount } = planDetails;

    return (
        <div className="mx-auto w-full max-w-lg">
            <h1 className="text-3xl font-bold tracking-tight mb-4">ऑर्डर सारांश</h1>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl capitalize flex items-center gap-2">
                        <CheckCircle className="text-primary h-7 w-7"/>
                        {planMap[plan]} योजना
                    </CardTitle>
                    <CardDescription>
                        भुगतान करने से पहले कृपया नीचे अपनी सदस्यता योजना का विवरण देखें।
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">सदस्यता शुल्क:</span>
                        <span className="font-semibold">₹{basePrice?.toLocaleString('en-IN')}</span>
                    </div>
                     {penalty > 0 && (
                         <>
                            <div className="flex justify-between items-center text-destructive">
                                <span className="text-sm">पुनः सक्रियण शुल्क:</span>
                                <span className="font-semibold text-sm">₹{penalty.toLocaleString('en-IN')}</span>
                            </div>
                             <div className="text-xs text-muted-foreground bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                                आपकी सदस्यता 2 महीने से अधिक समय से निष्क्रिय रहने के कारण पुनः सक्रियण शुल्क लागू होता है।
                            </div>
                        </>
                    )}
                    <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
                        <span>कुल राशि (INR):</span>
                        <span>₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    {plan === 'monthly' ? (
                        <CashfreeMonthlyButton />
                    ) : (
                         <PaymentButton
                            plan={plan}
                            amount={amount}
                            buttonText="भुगतान करने के लिए आगे बढ़ें"
                         />
                    )}
                    <Button variant="ghost" asChild className="text-sm text-muted-foreground">
                        <Link href="/hi/subscribe">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            योजनाओं पर वापस जाएं
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function OrderSummaryPageHi() {
    return (
        <Suspense fallback={<div>लोड हो रहा है...</div>}>
            <OrderSummaryContentHi />
        </Suspense>
    )
}
