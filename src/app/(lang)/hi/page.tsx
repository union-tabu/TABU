
"use client";

import { HeroSectionHi } from '@/components/landing/hero-section-new-hi';
import { AboutUsSectionHi } from '@/components/landing/about-us-section-hi';
import { WhyJoinSectionHi } from '@/components/landing/why-join-section-hi';
import { FaqSectionHi } from '@/components/landing/faq-section-hi';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { PricingSectionHi } from '@/components/landing/pricing-section-hi';

export default function HomeHi() {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSectionHi />
        <WhyJoinSectionHi />
        <PricingSectionHi />
        <AboutUsSectionHi />
        <FaqSectionHi />
      </main>
      <Footer />
    </div>
  );
}
