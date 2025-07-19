
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

export function HeroSection({ title, subtitle, buttonText, buttonLink }: HeroSectionProps) {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 bg-secondary flex items-center justify-center text-center">
      <div className="absolute inset-0 bg-primary/10"></div>
      <div className="container px-4 md:px-6 z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary-foreground font-headline">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/80">
            {subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform transform hover:scale-105">
              <Link href={buttonLink}>{buttonText} <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
