
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
              సభ్యత్వ ప్రణాళికలు
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              ప్రారంభించడానికి ఒక ప్రణాళికను ఎంచుకోండి. అన్ని ప్రణాళికలు మీ అధికారిక యూనియన్ ఐడితో సహా అవే గొప్ప ప్రయోజనాలను అందిస్తాయి.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            <Card className="flex flex-col shadow-lg border-primary">
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
                    <Link href="/te/subscribe">నెలవారీ ఎంచుకోండి</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex flex-col shadow-lg">
              <CardHeader>
                <CardTitle>వార్షిక ప్రణాళిక</CardTitle>
                <CardDescription>పూర్తి సంవత్సరానికి ముందుగానే చెల్లించి ఆదా చేసుకోండి.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold">₹1200</p>
                <p className="text-muted-foreground">సంవత్సరానికి</p>
              </CardContent>
              <CardFooter>
                 <Button asChild size="lg" className="w-full hover:bg-primary hover:text-primary-foreground" variant="outline">
                    <Link href="/te/subscribe">వార్షిక ఎంచుకోండి</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
