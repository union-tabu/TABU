"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const SigninForm = dynamic(() => import('@/components/auth/login-form'), { 
  ssr: false,
  loading: () => <SigninSkeleton />
});

function SigninSkeleton() {
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

// This is the new Client Component that holds the client-side logic
export default function SigninPageClient({ resetSuccess }: { resetSuccess: boolean }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!loading && isAuthenticated) {
      router.replace('/en/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // While checking auth or if user is authenticated, render a skeleton or nothing to prevent flashing.
  if (loading || isAuthenticated) {
    return <SigninSkeleton />;
  }
  
  // Only show the signin form if the user is not authenticated and the auth state has been loaded.
  return <SigninForm resetSuccess={resetSuccess} />;
}
