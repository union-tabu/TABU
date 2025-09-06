
"use client";

import { HeroSection } from '@/components/landing/hero-section-new';
import { AboutUsSection } from '@/components/landing/about-us-section';
import { WhyJoinSection } from '@/components/landing/why-join-section';
import { FaqSection } from '@/components/landing/faq-section';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { PricingSection } from '@/components/landing/pricing-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <WhyJoinSection />
        <PricingSection />
        <AboutUsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
