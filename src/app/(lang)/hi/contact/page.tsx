"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Mail, Phone, MapPin, FileText } from 'lucide-react';
import Image from 'next/image';

export default function ContactPageHi() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left side: Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-headline">हमसे संपर्क करें</h1>
                <p className="mt-4 text-lg text-gray-600">
                  हम यहाँ मदद करने के लिए हैं। किसी भी प्रश्न या चिंता के लिए हमसे संपर्क करें।
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-headline">ईमेल</h3>
                    <a href="mailto:uniontabu@gmail.com" className="text-lg text-primary hover:underline">
                      uniontabu@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-headline">फ़ोन</h3>
                    <a href="tel:+91-951-563-4065" className="text-lg text-primary hover:underline">
                      +91-951-563-4065
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-headline">पता</h3>
                    <p className="text-lg text-muted-foreground">
                      6-10-26/B/2, शिवरामपल्ली, राजेंद्रनगर, रंगारेड्डी
                    </p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-headline">पंजीकरण संख्या</h3>
                    <p className="text-lg text-muted-foreground">
                      H-115/2024
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Image */}
            <div className="flex items-center justify-center">
              <Image 
                src="/about-sec.jpg"
                alt="हमसे संपर्क करें"
                width={600}
                height={600}
                className="rounded-lg shadow-lg aspect-square object-cover"
              />
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
