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
    <section id="benefits" className="w-full bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Why Join the Union?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Membership in the Telangana Building Workers Union gives you more than just an ID. 
              It provides protection, support, and recognition to help you work with confidence and peace of mind.
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    <div className="text-gray-700">
                      {benefit.icon}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="text-center">
            <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-base font-medium">
              <Link href="/signup">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
