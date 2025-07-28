
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Join the Union. Secure Your Future.
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Become a registered member of the Telangana All Building Workers Union and get access to official ID, insurance benefits, and support when you need it the most. It only takes a few minutes to get started.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">Register</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="w-full h-80 lg:h-96 bg-gray-200 rounded-lg">
            {/* Placeholder for an image */}
          </div>
        </div>
      </div>
    </section>
  );
}
