"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const LoginFormTe = dynamic(() => import('@/components/auth/login-form-te'), { 
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
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPageClient() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
         if (searchParams.get('reset') === 'success') {
            toast({
                title: "పాస్‌వర్డ్ రీసెట్ విజయవంతమైంది!",
                description: "మీరు ఇప్పుడు మీ కొత్త పాస్‌వర్డ్‌తో సైన్ ఇన్ చేయవచ్చు.",
            });
            router.replace('/te/login', { scroll: false });
        }
    }, [searchParams, router, toast]);

    useEffect(() => {
        if (!loading && isAuthenticated) {
        router.replace('/te/dashboard');
        }
    }, [isAuthenticated, loading, router]);

    if (loading || isAuthenticated) {
        return <LoginSkeleton />;
    }

    return <LoginFormTe />;
}
