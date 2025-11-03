
"use client";

import { useAuth } from "@/context/auth-context";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { DashboardHeaderHi } from "@/components/layout/dashboard-header-hi";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

        </div>
      </main>
    </div>
  );
}
