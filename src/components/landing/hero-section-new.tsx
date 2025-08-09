
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 py-12 sm:py-16 lg:py-20 items-center min-h-[600px]">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-6 lg:space-y-8 order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              Join the Union. Secure Your Future.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Become a registered member of the Telangana All Building Workers Union and 
              get access to official ID, insurance benefits, and support when you need it the 
              most. It only takes a few minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg">
                <Link href="/signup">Register</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2 flex justify-center">
            <Image 
              src="/tabu-logo-website.png" 
              alt="Telangana All Building Workers Union Logo"
              width={400}
              height={400}
              className="w-auto h-auto rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
