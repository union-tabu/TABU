"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PricingSectionTe() {
  return (
    <section id="pricing" className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              మా సభ్యత్వ ప్రణాళిక
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              మీ అధికారిక యూనియన్ ఐడిని పొందడానికి మరియు అన్ని సభ్యుల ప్రయోజనాలను యాక్సెస్ చేయడానికి మా సరళమైన నెలవారీ ప్రణాళికతో యూనియన్‌లో చేరండి.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Card className="flex flex-col shadow-lg border-primary max-w-sm">
              <CardHeader>
                <CardTitle>నెలవారీ ప్రణాళిక</CardTitle>
                <CardDescription>యూనియన్‌తో ప్రారంభించడానికి అనువైనది.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold">₹100</p>
                <p className="text-muted-foreground">నెలకు, నెలవారీ బిల్ చేయబడుతుంది</p>
              </CardContent>
              <CardFooter>
                 <Button asChild size="lg" className="w-full">
                    <Link href="/te/payments">సభ్యులు అవ్వండి</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
