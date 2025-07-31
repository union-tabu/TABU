
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';

export function AboutUsSection() {
  return (
    <section id="about" className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-start">
            {/* Left side - Image */}
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="max-w-lg">
                <Image 
                    src="/about-sec.jpg" 
                    alt="Construction workers collaborating"
                    width={500}
                    height={450}
                    className="w-full h-auto object-cover rounded-lg shadow-lg"
                  />
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="order-1 lg:order-2 flex flex-col justify-center space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                About Us
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-base sm:text-lg">
                  Telangana All Building Workers Union is a collective of daily wage workers, 
                  construction laborers, and skilled tradespeople across Telangana, united to 
                  protect their rights and well-being.
                </p>
                
                <p className="text-base sm:text-lg">
                  We are committed to empowering every worker with identity, dignity, and access 
                  to essential benefits like insurance and financial support. By registering with 
                  the union, workers receive official recognition, a support system for wage 
                  recovery, and protection for their families in case of emergencies.
                </p>
                
                <p className="text-base sm:text-lg">
                  Whether you're working on a site in a village or in a city, this union is 
                  your voice, your strength, and your safety net.
                </p>
              </div>
              
              <div className="pt-4">
                <Button asChild size="lg">
                  <Link href="/signup">Register</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
