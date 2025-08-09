// src/app/login/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/header';

const LoginForm = dynamic(() => import('@/components/auth/login-form'), { 
  ssr: false,
  loading: () => <LoginSkeleton />
});

function LoginSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function LoginPageClient({ resetSuccess }: { resetSuccess: boolean }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // While checking auth or if user is authenticated, render a skeleton or nothing to prevent flashing.
  if (loading || isAuthenticated) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <LoginSkeleton />
            </main>
        </div>
    );
  }
  
  // Only show the login form if the user is not authenticated and the auth state has been loaded.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <LoginForm resetSuccess={resetSuccess} />
      </main>
    </div>
  );
}

export default function LoginPage({ searchParams }: { searchParams: { reset?: string } }) {
  const resetSuccess = searchParams?.reset === 'success';

  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginPageClient resetSuccess={resetSuccess} />
    </Suspense>
  )
}