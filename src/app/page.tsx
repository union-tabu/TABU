
"use client";

import { HeroSection } from '@/components/landing/hero-section';
import { BenefitsSection } from '@/components/landing/benefits-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { ContactSection } from '@/components/landing/contact-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection
        title="Welcome to Sanghika Samakhya"
        subtitle="Standing together for better rights, better pay, and a better future. Your strength is in unity."
        buttonText="Join The Union Today"
        buttonLink="/signup"
      />
      <BenefitsSection
        title="Why Join Us?"
        subtitle="Membership in Sanghika Samakhya offers numerous benefits to protect and enhance your work life."
        benefits={[
          {
            title: 'Legal Protection',
            description: 'Access to legal advice and representation for work-related issues.',
            icon: 'ShieldCheck'
          },
          {
            title: 'Collective Bargaining',
            description: 'We negotiate for better wages, benefits, and working conditions on your behalf.',
            icon: 'Users'
          },
          {
            title: 'Community Support',
            description: 'Join a network of fellow workers for solidarity and mutual support.',
            icon: 'HeartHandshake'
          },
          {
            title: 'A Stronger Voice',
            description: 'Together, we have a powerful voice to advocate for change and justice.',
            icon: 'Megaphone'
          }
        ]}
      />
      <PricingSection
        title="Membership Plans"
        subtitle="Choose a plan that works for you. All plans offer full benefits."
        monthlyPlan={{
          title: 'Monthly Plan',
          price: '₹50',
          period: '/month',
          features: ['Full Membership Benefits', 'Flexible Commitment', 'Automatic Renewal'],
          buttonText: 'Choose Monthly'
        }}
        yearlyPlan={{
          title: 'Yearly Plan',
          price: '₹600',
          period: '/year',
          features: ['Full Membership Benefits', 'Save on yearly subscription', 'Set it and forget it'],
          buttonText: 'Choose Yearly',
          popular: true
        }}
      />
      <TestimonialsSection
        title="From Our Members"
        subtitle="Hear what our members have to say about the impact of the union."
        testimonials={[
          {
            quote: `"The union gave me the confidence to speak up. With their support, we secured better safety equipment for everyone on site."`,
            name: 'Ravi Kumar',
            role: 'Construction Worker',
            avatar: 'https://placehold.co/40x40.png',
            avatarHint: 'male worker',
            fallback: 'RK'
          },
          {
            quote: `"When my pay was unfairly docked, the union's legal team stepped in and resolved it within days. I'm so grateful."`,
            name: 'Sunita Patel',
            role: 'Garment Factory Employee',
            avatar: 'https://placehold.co/40x40.png',
            avatarHint: 'female worker',
            fallback: 'SP'
          },
          {
            quote: `"Being part of the union means I'm not alone. It's a family that looks out for you, on and off the job."`,
            name: 'Anil Joshi',
            role: 'Logistics Staff',
            avatar: 'https://placehold.co/40x40.png',
            avatarHint: 'male employee',
            fallback: 'AJ'
          }
        ]}
      />
      <ContactSection
        title="Get In Touch"
        subtitle="We are here to help. Contact us with any questions or concerns."
        address="123 Union Lane, Worker's City, 500001"
        phone="+91 123 456 7890"
        email="contact@sanghika.org"
      />
    </div>
  );
}
