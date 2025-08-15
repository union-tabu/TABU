"use client";

import { useAuth } from "@/context/auth-context";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { DashboardHeaderHi } from "@/components/layout/dashboard-header-hi";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addMonths, differenceInDays, startOfMonth, format } from 'date-fns';
import { hi } from 'date-fns/locale';

export default function DashboardPageHi() {
  const { userData, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/hi/signin');
      } else if (userData?.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [isAuthenticated, loading, userData, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('शुभ प्रभात');
    } else if (hour < 18) {
      setGreeting('शुभ दोपहर');
    } else {
      setGreeting('शुभ संध्या');
    }
  }, []);

  let daysLeft: number | null = null;
  let expiryDate: Date | null = null;
  let accountIsInactive = false;
  const userStatus = userData?.subscription?.status || 'pending';

  if (userData && userStatus === 'pending') {
    const now = new Date();
    const gracePeriodStartDate = userData.subscription?.renewalDate
        ? new Date(userData.subscription.renewalDate.seconds * 1000)
        : new Date(userData.createdAt.seconds * 1000);

    const calculatedExpiryDate = startOfMonth(addMonths(gracePeriodStartDate, 2));
    const calculatedDaysLeft = differenceInDays(calculatedExpiryDate, now);
      
    if (calculatedDaysLeft > 0) {
      daysLeft = calculatedDaysLeft;
      expiryDate = calculatedExpiryDate;
    } else {
      accountIsInactive = true;
    }
  }

  if (loading || !isAuthenticated || userData?.role === 'admin') {
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
      <DashboardHeaderHi />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">डैशबोर्ड</h1>
            {userData && (
                <p className="text-lg text-muted-foreground mt-2">
                   {greeting}, {userData.fullName}!
                </p>
            )}
          </div>
          
          <SubscriptionStatusCard isHindi={true} />

          {daysLeft !== null && expiryDate && userStatus !== 'active' && (
             <Card className="border-amber-500 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Clock className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-amber-800">सदस्यता ग्रेस पीरियड</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                   आपके खाते के निष्क्रिय होने से पहले सदस्यता लेने के लिए आपके पास <span className="font-bold">{daysLeft}</span> दिन शेष हैं।
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    आपका ग्रेस पीरियड {format(expiryDate, "MMMM dd, yyyy", { locale: hi })} को समाप्त होगा।
                </p>
                 <Button asChild size="sm" className="mt-4">
                  <Link href="/hi/subscribe">अभी सदस्यता लें</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {accountIsInactive && userStatus !== 'active' && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>खाता निष्क्रिय</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <p>आपका ग्रेस पीरियड समाप्त हो गया है। कृपया अपने खाते को पुनः सक्रिय करने और सभी लाभों तक पहुंचने के लिए सदस्यता लें।</p>
                <Button asChild size="sm" variant="destructive">
                  <Link href="/hi/subscribe">अभी सदस्यता लें</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

        </div>
      </main>
    </div>
  );
}
