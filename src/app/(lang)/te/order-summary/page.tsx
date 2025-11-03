
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Suspense, useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { CashfreeMonthlyButton } from "@/components/cashfree-monthly-button";
import { CashfreeAnnualButton } from "@/components/cashfree-annual-button";

type PlanType = 'monthly' | 'yearly';

interface PlanDetails {
    plan: PlanType;
    amount: number;
}

function OrderSummaryContentTe() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userData, loading: authLoading } = useAuth();

    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const MONTHLY_PRICE = 100;
    const YEARLY_PRICE = 1200;
    const planMap: { [key: string]: string } = { 'monthly': 'నెలవారీ', 'yearly': 'వార్షిక' };

    const planParam = useMemo(() => {
        const param = searchParams.get('plan');
        return param && ['monthly', 'yearly'].includes(param) ? param as PlanType : null;
    }, [searchParams]);

    useEffect(() => {
        if (!planParam) {
            setError('చెల్లని ప్లాన్ ఎంచుకోబడింది');
            setTimeout(() => {
                router.replace('/te/subscribe');
            }, 2000);
            return;
        }

        if (authLoading) return;

        try {
            const totalAmount = planParam === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;

            setPlanDetails({ plan: planParam, amount: totalAmount });
            setError(null);
        } catch (err) {
            console.error('ధర వివరాలను గణించడంలో లోపం:', err);
            setError('ధరను గణించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.');
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
                <Card className="border-destructive"><CardHeader className="text-center"><AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" /><CardTitle className="text-destructive">లోపం</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardFooter><Button asChild className="w-full"><Link href="/te/subscribe">ప్లాన్‌లకు తిరిగి వెళ్లండి</Link></Button></CardFooter></Card>
            </div>
        );
    }
    
    if (!planDetails) return null;

    const { plan, amount } = planDetails;

    return (
        <div className="mx-auto w-full max-w-lg">
            <h1 className="text-3xl font-bold tracking-tight mb-4">ఆర్డర్ సారాంశం</h1>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl capitalize flex items-center gap-2">
                        <CheckCircle className="text-primary h-7 w-7"/>
                        {planMap[plan]} ప్రణాళిక
                    </CardTitle>
                    <CardDescription>
                        చెల్లింపు చేయడానికి ముందు దయచేసి మీ సభ్యత్వ ప్రణాళిక వివరాలను క్రింద సమీక్షించండి.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-lg">
                    <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
                        <span>మొత్తం (INR):</span>
                        <span>₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    {plan === 'monthly' ? (
                        <CashfreeMonthlyButton />
                    ) : (
                        <CashfreeAnnualButton />
                    )}
                    <Button variant="ghost" asChild className="text-sm text-muted-foreground">
                        <Link href="/te/subscribe">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            ప్రణాళికలకు తిరిగి వెళ్లండి
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}


export default function OrderSummaryPageTe() {
    return (
        <Suspense fallback={<div>లోడ్ అవుతోంది...</div>}>
            <OrderSummaryContentTe />
        </Suspense>
    )
}
