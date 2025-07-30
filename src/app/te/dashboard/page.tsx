
"use client";

import { useAuth } from "@/context/auth-context";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { DashboardHeaderTe } from "@/components/layout/dashboard-header-te";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserCheck, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addMonths, differenceInDays, startOfMonth, format } from 'date-fns';
import { te } from 'date-fns/locale';

export default function DashboardPageTe() {
  const { userData, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/te/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('శుభోదయం');
    } else if (hour < 18) {
      setGreeting('శుభ మధ్యాహ్నం');
    } else {
      setGreeting('శుభ సాయంత్రం');
    }
  }, []);

  const isProfileIncomplete = userData && (!userData.address || !userData.email || !userData.dob);

  let daysLeft: number | null = null;
  let expiryDate: Date | null = null;
  let accountIsInactive = false;
  const userStatus = userData?.subscription?.status || 'not subscribed';

  if (userData && userStatus === 'not subscribed') {
    const now = new Date();
    // Determine the start date for the grace period calculation
    const gracePeriodStartDate = userData.subscription?.renewalDate
        ? new Date(userData.subscription.renewalDate.seconds * 1000) // For expired members
        : new Date(userData.createdAt.seconds * 1000); // For new members

    // Grace period ends at the start of the month, 2 months after the start date's month.
    const calculatedExpiryDate = startOfMonth(addMonths(gracePeriodStartDate, 2));
    const calculatedDaysLeft = differenceInDays(calculatedExpiryDate, now);
      
    if (calculatedDaysLeft > 0) {
      daysLeft = calculatedDaysLeft;
      expiryDate = calculatedExpiryDate;
    } else {
      // This means the grace period has passed
      accountIsInactive = true;
    }
  }


  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
          <Skeleton className="h-6 w-32" />
          <div className="hidden md:flex items-center justify-center flex-1 gap-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeaderTe />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">డాష్‌బోర్డ్</h1>
            {userData && (
                <p className="text-lg text-muted-foreground mt-2">
                   {greeting}, {userData.firstName}!
                </p>
            )}
          </div>
          
          {isProfileIncomplete && (
            <Alert>
              <UserCheck className="h-4 w-4" />
              <AlertTitle>మీ ప్రొఫైల్‌ను పూర్తి చేయండి</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <p>దయచేసి మీ ప్రొఫైల్‌ను పూర్తి చేయడానికి మీ చిరునామా, ఇమెయిల్ మరియు పుట్టిన తేదీని జోడించండి.</p>
                <Button asChild size="sm">
                  <Link href="/te/profile">ప్రొఫైల్‌కు వెళ్లండి</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {daysLeft !== null && expiryDate && userStatus !== 'active' && (
             <Card className="border-amber-500 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Clock className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-amber-800">సభ్యత్వ గ్రేస్ పీరియడ్</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                   మీ ఖాతా నిష్క్రియంగా మారడానికి ముందు సభ్యత్వాన్ని పొందడానికి మీకు <span className="font-bold">{daysLeft}</span> రోజులు మిగిలి ఉన్నాయి.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    మీ గ్రేస్ పీరియడ్ {format(expiryDate, "MMMM dd, yyyy", { locale: te })}న ముగుస్తుంది.
                </p>
                 <Button asChild size="sm" className="mt-4">
                  <Link href="/te/subscribe">ఇప్పుడే సభ్యత్వాన్ని పొందండి</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {accountIsInactive && userStatus !== 'active' && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ఖాతా నిష్క్రియం చేయబడింది</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <p>మీ గ్రేస్ పీరియడ్ ముగిసింది. దయచేసి మీ ఖాతాను పునఃప్రారంభించడానికి మరియు అన్ని ప్రయోజనాలను పొందడానికి సభ్యత్వాన్ని పొందండి.</p>
                <Button asChild size="sm" variant="destructive">
                  <Link href="/te/subscribe">ఇప్పుడే సభ్యత్వాన్ని పొందండి</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <SubscriptionStatusCard isTelugu={true} />
        </div>
      </main>
    </div>
  );
}
