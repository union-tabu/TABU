
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// This page now simply acts as a redirect to the new dashboard location.
export default function AdminRootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/dashboard');
    }, [router]);

    // Render a skeleton loading UI while the redirect is happening
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
