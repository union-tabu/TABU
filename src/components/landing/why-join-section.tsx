
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DollarSign, ShieldCheck, FileText } from 'lucide-react';

const benefits = [
  {
    icon: <DollarSign className="h-8 w-8" />,
    title: 'Financial Support',
    description: 'Your family gets immediate support of ₹10,000 if something unfortunate happens. We stand by your loved ones when it matters most.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: 'Help with Your Issues',
    description: "If you're not paid for your work, the union will step in to help you recover your rightful wages through legal and community support.",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Official Union ID',
    description: 'Get a verified union ID that proves your membership and increases trust with employers and contractors across Telangana.',
  },
];

export function WhyJoinSection() {
  return (
    <section id="benefits" className="w-full py-16 md:py-24 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Why Join the Union?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Membership in the Telangana Building Workers Union gives you more than just an ID. It provides protection, support, and recognition to help you work with confidence and peace of mind.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center shadow-none border-none bg-transparent">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  {benefit.icon}
                </div>
                <CardTitle className="mt-4 text-xl font-semibold">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-16 text-center">
            <Button asChild>
                <Link href="/signup">Register</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
