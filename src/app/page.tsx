
"use client";

import { HeroSection } from '@/components/landing/hero-section-new';
import { AboutUsSection } from '@/components/landing/about-us-section';
import { WhyJoinSection } from '@/components/landing/why-join-section';
import { FaqSection } from '@/components/landing/faq-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
           <div className="h-96 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </section>
      <AboutUsSection />
      <WhyJoinSection />
      <FaqSection />
    </div>
  );
}
