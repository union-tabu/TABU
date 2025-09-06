
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
              Membership Plans
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Choose a plan to get started. All plans offer the same great benefits, including your official Union ID.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            <Card className="flex flex-col shadow-lg border-primary">
              <CardHeader>
                <CardTitle>Monthly Plan</CardTitle>
                <CardDescription>Ideal for getting started with the union.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold">₹100</p>
                <p className="text-muted-foreground">per month, billed monthly</p>
              </CardContent>
              <CardFooter>
                 <Button asChild size="lg" className="w-full">
                    <Link href="/en/subscribe">Choose Monthly</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex flex-col shadow-lg">
              <CardHeader>
                <CardTitle>Annual Plan</CardTitle>
                <CardDescription>Save by paying for a full year upfront.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold">₹1200</p>
                <p className="text-muted-foreground">per year</p>
              </CardContent>
              <CardFooter>
                 <Button asChild size="lg" className="w-full" variant="outline">
                    <Link href="/en/subscribe">Choose Annual</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
