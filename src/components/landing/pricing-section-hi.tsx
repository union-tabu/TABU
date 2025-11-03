"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PricingSectionHi() {
  return (
    <section id="pricing" className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              सदस्यता योजनाएं
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              शुरू करने के लिए एक योजना चुनें। सभी योजनाएं समान महान लाभ प्रदान करती हैं, जिसमें आपकी आधिकारिक यूनियन आईडी भी शामिल है।
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            <Card className="flex flex-col shadow-lg border-primary">
              <CardHeader>
                <CardTitle>मासिक योजना</CardTitle>
                <CardDescription>संघ के साथ आरंभ करने के लिए आदर्श।</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold">₹100</p>
                <p className="text-muted-foreground">प्रति माह, मासिक बिल किया गया</p>
              </CardContent>
              <CardFooter>
                 <Button asChild size="lg" className="w-full">
                    <Link href="/hi/payments">मासिक चुनें</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex flex-col shadow-lg">
              <CardHeader>
                <CardTitle>वार्षिक योजना</CardTitle>
                <CardDescription>सुविधा के लिए पूरे वर्ष के लिए अग्रिम भुगतान करें।</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold">₹1200</p>
                <p className="text-muted-foreground">प्रति वर्ष</p>
              </CardContent>
              <CardFooter>
                 <Button asChild size="lg" className="w-full hover:bg-primary hover:text-primary-foreground" variant="outline">
                    <Link href="/hi/payments">वार्षिक चुनें</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
