"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-background px-4 py-12">
        <div className="text-center space-y-6">
            <div className="flex justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
          <h1 className="text-6xl font-bold text-destructive">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or maybe you just mistyped the URL.
          </p>
          <Button asChild size="lg">
            <Link href="/en">Go Back Home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
