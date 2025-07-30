"use client";

import { HeroSection } from '@/components/landing/hero-section-new';
import { AboutUsSection } from '@/components/landing/about-us-section';
import { WhyJoinSection } from '@/components/landing/why-join-section';
import { FaqSection } from '@/components/landing/faq-section';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <WhyJoinSection />
        <AboutUsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
