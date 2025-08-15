"use client";

import { useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardHeaderTe } from "@/components/layout/dashboard-header-te";
import { DashboardHeaderHi } from "@/components/layout/dashboard-header-hi";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'en';

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        const signinPath = `/${lang}/signin`;
        router.replace(signinPath);
      } 
      else if (userData?.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [isAuthenticated, loading, userData, router, lang]);

  if (loading || !isAuthenticated || userData?.role === 'admin') {
    return (
      <div className="flex min-h-screen w-full flex-col">
        {/* Skeleton Header */}
        <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 z-50">
          <Skeleton className="h-6 w-32" />
          <div className="hidden md:flex items-center justify-center flex-1 gap-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        {/* Skeleton Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }
  
  const getHeader = () => {
    switch (lang) {
        case 'te': return <DashboardHeaderTe />;
        case 'hi': return <DashboardHeaderHi />;
        default: return <DashboardHeader />;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      {getHeader()}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
