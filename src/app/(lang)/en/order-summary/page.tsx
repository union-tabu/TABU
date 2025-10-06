
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
import { CashfreeAnnualButton } from "@/components/cashfree-annual-button";

type PlanType = 'monthly' | 'yearly';

interface PlanDetails {
    plan: PlanType;
    basePrice: number;
    penalty: number;
    amount: number;
    isLapsed: boolean;
}

function OrderSummaryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userData, loading: authLoading } = useAuth();

    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const PENALTY_FEE = 500;
    const MONTHLY_PRICE = 100;
    const YEARLY_PRICE = 1200;

    const planParam = useMemo(() => {
        const param = searchParams.get('plan');
        return param && ['monthly', 'yearly'].includes(param) ? param as PlanType : null;
    }, [searchParams]);

    useEffect(() => {
        if (!planParam) {
            setError('Invalid plan selected');
            setTimeout(() => {
                router.replace('/en/subscribe');
            }, 2000);
            return;
        }

        if (authLoading) {
            return;
        }

        try {
            let isLapsed = false;
            let penalty = 0;

            if (userData?.subscription?.status === 'pending') {
                const now = new Date();
                const gracePeriodStartDate = userData.subscription?.renewalDate
                    ? new Date(userData.subscription.renewalDate.seconds * 1000)
                    : new Date(userData.createdAt.seconds * 1000);
                
                const monthsDiff = differenceInMonths(startOfMonth(now), startOfMonth(gracePeriodStartDate));
                
                if (monthsDiff >= 2) {
                    isLapsed = true;
                    penalty = PENALTY_FEE;
                }
            }
            
            const basePrice = planParam === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE;
            const totalAmount = basePrice + penalty;

            setPlanDetails({
                plan: planParam,
                basePrice,
                penalty,
                amount: totalAmount,
                isLapsed
            });

            setError(null);
        } catch (err) {
            console.error('Error calculating plan details:', err);
            setError('Failed to calculate pricing. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [planParam, authLoading, userData, router]);

    if (loading || authLoading) {
        return (
            <div className="mx-auto w-full max-w-lg">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-5 w-1/3" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-5 w-1/4" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-12 w-full" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto w-full max-w-lg">
                <Card className="border-destructive">
                    <CardHeader className="text-center">
                        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/en/subscribe">Back to Plans</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!planDetails) {
        return null;
    }

    const { plan, basePrice, penalty, amount } = planDetails;

    return (
        <div className="mx-auto w-full max-w-lg">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Order Summary</h1>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl capitalize flex items-center gap-2">
                        <CheckCircle className="text-primary h-7 w-7"/>
                        {plan} Plan
                    </CardTitle>
                    <CardDescription>
                        Please review your membership plan details below before proceeding to payment.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="grid gap-4 text-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Membership Fee:</span>
                        <span className="font-semibold">₹{basePrice?.toLocaleString('en-IN')}</span>
                    </div>
                    
                    {penalty > 0 && (
                        <>
                            <div className="flex justify-between items-center text-destructive">
                                <span className="text-sm">Reactivation Fee:</span>
                                <span className="font-semibold text-sm">₹{penalty.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                                A reactivation fee applies because your subscription has been inactive for more than 2 months.
                            </div>
                        </>
                    )}
                    
                    <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
                        <span>Total Amount (INR):</span>
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
                        <Link href="/en/subscribe">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Plans
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            
            <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
                <p>
                    Your payment is secured by Cashfree Payments. 
                    We accept all major credit cards, debit cards, and UPI.
                </p>
                <p>
                    By proceeding, you agree to our terms of service and privacy policy.
                </p>
            </div>
        </div>
    );
}

export default function OrderSummaryPage() {
    return (
        <Suspense 
            fallback={
                <div className="mx-auto w-full max-w-lg">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                        <Card>
                            <CardHeader className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-full"></div>
                                <div className="h-5 bg-gray-200 rounded w-full"></div>
                                <div className="h-6 bg-gray-200 rounded w-full"></div>
                            </CardContent>
                            <CardFooter>
                                <div className="h-12 bg-gray-200 rounded w-full"></div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            }
        >
            <OrderSummaryContent />
        </Suspense>
    );
}
