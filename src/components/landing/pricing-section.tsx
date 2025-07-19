
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { PaymentButton } from '@/components/payment-button';

interface Plan {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  popularText?: string;
}

interface PricingSectionProps {
  title: string;
  subtitle: string;
  monthlyPlan: Plan;
  yearlyPlan: Plan;
}

export function PricingSection({ title, subtitle, monthlyPlan, yearlyPlan }: PricingSectionProps) {
  return (
    <section id="pricing" className="w-full py-16 md:py-24 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground font-headline">{title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="mt-16 mx-auto grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-2">
          {/* Monthly Plan */}
          <Card className="flex flex-col rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center p-8">
              <CardTitle className="text-2xl font-headline">{monthlyPlan.title}</CardTitle>
              <CardDescription className="mt-2 text-4xl font-bold text-primary">{monthlyPlan.price}<span className="text-lg font-medium text-muted-foreground">{monthlyPlan.period}</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-8">
              <ul className="space-y-4 text-muted-foreground">
                {monthlyPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8">
              <PaymentButton plan="monthly" amount={50} buttonText={monthlyPlan.buttonText} />
            </CardFooter>
          </Card>

          {/* Yearly Plan */}
          <Card className="flex flex-col rounded-2xl border-2 border-accent shadow-2xl hover:scale-105 transition-transform duration-300 relative">
            {yearlyPlan.popular && (
              <div className="absolute top-0 right-4 -mt-4">
                <div className="bg-accent text-accent-foreground text-sm font-semibold py-1 px-3 rounded-full">{yearlyPlan.popularText || 'Most Popular'}</div>
              </div>
            )}
            <CardHeader className="text-center p-8">
              <CardTitle className="text-2xl font-headline">{yearlyPlan.title}</CardTitle>
              <CardDescription className="mt-2 text-4xl font-bold text-primary">{yearlyPlan.price}<span className="text-lg font-medium text-muted-foreground">{yearlyPlan.period}</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-8">
              <ul className="space-y-4 text-muted-foreground">
                {yearlyPlan.features.map((feature, index) => (
                   <li key={index} className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />{feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8">
              <PaymentButton plan="yearly" amount={600} buttonText={yearlyPlan.buttonText} variant="accent" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
