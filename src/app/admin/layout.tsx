
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, or not an admin, redirect
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/signin');
      } else if (userData?.role !== 'admin') {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, loading, userData, router]);

  // While loading or if user is not a confirmed admin, show a skeleton UI
  if (loading || !isAuthenticated || userData?.role !== 'admin') {
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

  // If authenticated admin, render the actual admin layout
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AdminHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
