"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This root page will now redirect to the default language (English).
export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/en');
    }, [router]);

    // You can render a loading skeleton here if desired
    return null;
}
