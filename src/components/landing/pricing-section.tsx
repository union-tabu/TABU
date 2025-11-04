"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PricingSection() {
  return (
    <section id="pricing" className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Our Membership Plan
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Join the union with our straightforward monthly plan to get your official Union ID and access all member benefits.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Card className="flex flex-col shadow-lg border-primary max-w-sm">
              <CardHeader>
                <CardTitle>Monthly Plan</CardTitle>
                <CardDescription>The best way to get started with the union.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold">₹100</p>
                <p className="text-muted-foreground">per month, billed monthly</p>
              </CardContent>
              <CardFooter>
                 <Button asChild size="lg" className="w-full">
                    <Link href="/en/payments">Become a Member</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
