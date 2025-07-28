
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const LoginForm = dynamic(() => import('@/components/auth/login-form'), { 
  ssr: false,
  loading: () => (
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
});

export default function LoginPage() {
  return <LoginForm />;
}
