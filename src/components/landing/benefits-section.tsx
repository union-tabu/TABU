
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, HeartHandshake, Megaphone } from 'lucide-react';

const iconMap = {
  ShieldCheck: <ShieldCheck className="h-8 w-8 text-primary" />,
  Users: <Users className="h-8 w-8 text-primary" />,
  HeartHandshake: <HeartHandshake className="h-8 w-8 text-primary" />,
  Megaphone: <Megaphone className="h-8 w-8 text-primary" />,
};

type BenefitIcon = keyof typeof iconMap;

interface Benefit {
  title: string;
  description: string;
  icon: BenefitIcon;
}

interface BenefitsSectionProps {
  title: string;
  subtitle: string;
  benefits: Benefit[];
}

export function BenefitsSection({ title, subtitle, benefits }: BenefitsSectionProps) {
  return (
    <section id="benefits" className="w-full py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground font-headline">{title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {iconMap[benefit.icon]}
                </div>
                <CardTitle className="mt-4 font-headline">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
