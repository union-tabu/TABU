
"use client";

import { useAuth } from "@/context/auth-context";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { DashboardHeaderTe } from "@/components/layout/dashboard-header-te";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import Link from "next/link";

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

          <SubscriptionStatusCard isTelugu={true} />
        </div>
      </main>
    </div>
  );
}
