
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const LoginForm = dynamic(() => import('@/components/auth/login-form'), { 
  ssr: false,
  loading: () => <LoginSkeleton />
});

function LoginSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
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
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast({
        title: "Registration Successful!",
        description: "Please log in with your new credentials.",
      });
      // Remove the query param from the URL
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    // If not loading and already authenticated, redirect immediately.
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // While checking auth or if user is authenticated, render nothing to make redirection feel faster.
  // The user will see a blank screen for a moment instead of a skeleton loader.
  if (loading || isAuthenticated) {
    return null;
  }
  
  // Only show the login form if the user is not authenticated and the auth state has been loaded.
  return <LoginForm />;
}
