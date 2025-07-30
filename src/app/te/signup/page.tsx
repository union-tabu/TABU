
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/header';

const SignupFormTe = dynamic(() => import('@/components/auth/signup-form-te'), { 
  ssr: false,
  loading: () => <SignupSkeleton />
});

function SignupSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
            <div className="mx-auto max-w-2xl w-full space-y-4">
                <div className="space-y-2 text-center">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-5 w-64 mx-auto" />
                </div>
                <div className="space-y-4 p-6 border rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                     <Skeleton className="h-12 w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

function SignupPageTeClient() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/te/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return <SignupSkeleton />;
  }
  
  return <SignupFormTe />;
}

export default function SignupPageTe() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<SignupSkeleton />}>
          <SignupPageTeClient />
        </Suspense>
      </main>
    </div>
  );
}
