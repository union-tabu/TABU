"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSectionHi() {
  return (
    <section className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 py-12 sm:py-16 lg:py-20 items-center min-h-[600px]">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-6 lg:space-y-8 order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              यूनियन से जुड़ें। अपना भविष्य सुरक्षित करें।
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
              तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन के पंजीकृत सदस्य बनें और आधिकारिक आईडी, बीमा लाभ, और जब आपको इसकी सबसे अधिक आवश्यकता हो तब समर्थन प्राप्त करें। शुरू करने में केवल कुछ मिनट लगते हैं।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg">
                <Link href="/hi/signup">पंजीकरण करें</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/hi/signin">साइन इन करें</Link>
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
