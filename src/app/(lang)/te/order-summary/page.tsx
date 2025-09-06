
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { PaymentButton } from "@/components/payment-button";
import { differenceInMonths, startOfMonth } from 'date-fns';

function OrderSummaryContentTe() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userData, loading: authLoading } = useAuth();

    const [plan, setPlan] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [basePrice, setBasePrice] = useState<number | null>(null);
    const [penalty, setPenalty] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    
    const PENALTY_FEE = 500;
    const MONTHLY_PRICE = 100;
    const YEARLY_PRICE = 1200;
    
    const planMap: { [key: string]: string } = { 'monthly': 'నెలవారీ', 'yearly': 'వార్షిక' };

    useEffect(() => {
        const planParam = searchParams.get('plan');
        
        if (!planParam || !['monthly', 'yearly'].includes(planParam)) {
            router.replace('/te/subscribe');
            return;
        }

        let isLapsed = false;
        if (userData?.subscription?.status === 'pending') {
            const now = new Date();
            const gracePeriodStartDate = userData.subscription?.renewalDate
                ? new Date(userData.subscription.renewalDate.seconds * 1000)
                : new Date(userData.createdAt.seconds * 1000);
            
            if (differenceInMonths(startOfMonth(now), startOfMonth(gracePeriodStartDate)) >= 2) {
                isLapsed = true;
                setPenalty(PENALTY_FEE);
            }
        }
        
        const currentBasePrice = planParam === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
        const finalAmount = isLapsed ? currentBasePrice + PENALTY_FEE : currentBasePrice;

        setPlan(planParam);
        setBasePrice(currentBasePrice);
        setAmount(finalAmount);

    }, [searchParams, router, userData]);
    
    useEffect(() => {
        if (!authLoading && amount !== null) {
            setLoading(false);
        }
    }, [authLoading, amount])

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-lg">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/3" /></div>
                        <div className="flex justify-between"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-1/4" /></div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-6 w-1/3" /></div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-12 w-full" />
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (!plan || amount === null) return null;

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
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">సభ్యత్వ రుసుము:</span>
                        <span className="font-semibold">₹{basePrice?.toLocaleString('en-IN')}</span>
                    </div>
                     {penalty > 0 && (
                        <div className="flex justify-between items-center text-destructive">
                            <span className="text-sm">పునఃప్రారంభ రుసుము:</span>
                            <span className="font-semibold text-sm">₹{penalty.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                    <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
                        <span>మొత్తం (INR):</span>
                        <span>₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <PaymentButton
                        plan={plan as 'monthly' | 'yearly'}
                        amount={amount}
                        buttonText="చెల్లింపుకు కొనసాగండి"
                     />
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
