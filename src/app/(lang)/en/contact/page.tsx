"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Mail, Phone, MapPin, FileText } from 'lucide-react';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left side: Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Contact Us</h1>
                <p className="mt-4 text-lg text-gray-600">
                  We're here to help. Reach out to us with any questions or concerns.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Email</h3>
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
                    <h3 className="text-xl font-semibold">Phone</h3>
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
                    <h3 className="text-xl font-semibold">Address</h3>
                    <p className="text-lg text-muted-foreground">
                      Telangana All Building Workers Union, 6-10-26/B/2, Shivarampally, Rajendranagar, Rangareddy
                    </p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Registration No.</h3>
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
                alt="Contact us illustration"
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
