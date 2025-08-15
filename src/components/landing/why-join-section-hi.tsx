"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IndianRupee, ShieldCheck, FileText } from 'lucide-react';

const benefits = [
  {
    icon: <IndianRupee className="h-8 w-8" />,
    title: 'वित्तीय सहायता',
    description: 'यदि कुछ दुर्भाग्यपूर्ण होता है तो आपके परिवार को ₹10,000 की तत्काल सहायता मिलती है। हम आपके प्रियजनों के साथ तब खड़े रहते हैं जब यह सबसे ज्यादा मायने रखता है।',
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: 'आपके मुद्दों में मदद',
    description: "यदि आपको आपके काम के लिए भुगतान नहीं किया जाता है, तो संघ कानूनी और सामुदायिक समर्थन के माध्यम से आपकी उचित मजदूरी वसूल करने में मदद करेगा।",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'आधिकारिक यूनियन आईडी',
    description: 'एक सत्यापित यूनियन आईडी प्राप्त करें जो आपकी सदस्यता को साबित करती है और पूरे तेलंगाना में नियोक्ताओं और ठेकेदारों के साथ विश्वास बढ़ाती है।',
  },
];

export function WhyJoinSectionHi() {
  return (
    <section id="benefits" className="w-full bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              यूनियन में क्यों शामिल हों?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              तेलंगाना बिल्डिंग वर्कर्स यूनियन में सदस्यता आपको सिर्फ एक आईडी से ज्यादा देती है। यह आपको आत्मविश्वास और मन की शांति के साथ काम करने में मदद करने के लिए सुरक्षा, समर्थन और मान्यता प्रदान करती है।
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className={`
                  text-left group bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200
                  ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}
                `}
              >
                <CardContent className="flex flex-col items-start p-0">
                  <div className="mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <div className="text-gray-700">
                        {benefit.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/hi/signup">पंजीकरण करें</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
