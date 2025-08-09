"use client";

import { HeroSectionTe } from '@/components/landing/hero-section-new-te';
import { AboutUsSectionTe } from '@/components/landing/about-us-section-te';
import { WhyJoinSectionTe } from '@/components/landing/why-join-section-te';
import { FaqSectionTe } from '@/components/landing/faq-section-te';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default function HomeTe() {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSectionTe />
        <WhyJoinSectionTe />
        <AboutUsSectionTe />
        <FaqSectionTe />
      </main>
      <Footer />
    </div>
  );
}
