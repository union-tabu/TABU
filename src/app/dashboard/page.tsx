
"use client";

import { useAuth } from "@/context/auth-context";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserCheck, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addMonths, differenceInDays, startOfMonth, format } from 'date-fns';

export default function DashboardPage() {
  const { userData, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

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
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {userData && (
                <p className="text-lg text-muted-foreground mt-2">
                  {greeting}, {userData.fullName}!
                </p>
            )}
          </div>
          
          {daysLeft !== null && expiryDate && userStatus !== 'active' && (
             <Card className="border-amber-500 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Clock className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-amber-800">Subscription Grace Period</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  You have <span className="font-bold">{daysLeft}</span> days left to subscribe before your account becomes inactive.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Your grace period ends on {format(expiryDate, "MMMM dd, yyyy")}.
                </p>
                 <Button asChild size="sm" className="mt-4">
                  <Link href="/subscribe">Subscribe Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {accountIsInactive && userStatus !== 'active' && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Account Inactive</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <p>Your grace period has ended. Please subscribe to reactivate your account and access all benefits.</p>
                <Button asChild size="sm" variant="destructive">
                  <Link href="/subscribe">Subscribe Now</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}


          <SubscriptionStatusCard />
        </div>
      </main>
    </div>
  );
}
