
"use client";

import Link from 'next/link';
import { Users, Twitter, Facebook, Instagram } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isTelugu = pathname.startsWith('/te');

  const homeLink = isTelugu ? '/te' : '/';
  const benefitsLink = isTelugu ? '/te#benefits' : '#benefits';
  const pricingLink = isTelugu ? '/te#pricing' : '#pricing';
  const dashboardLink = isTelugu ? '/te/dashboard' : '/dashboard';
  const contactLink = isTelugu ? '/te#contact' : '#contact';

  const quickLinksText = isTelugu ? 'త్వరిత లింకులు' : 'Quick Links';
  const benefitsText = isTelugu ? 'ప్రయోజనాలు' : 'Benefits';
  const pricingText = isTelugu ? 'ధర' : 'Pricing';
  const dashboardText = isTelugu ? 'డాష్‌బోర్డ్' : 'Dashboard';
  const contactUsText = isTelugu ? 'మమ్మల్ని సంప్రదించండి' : 'Contact Us';
  const contactText = isTelugu ? 'సంప్రదించండి' : 'Contact';
  const followUsText = isTelugu ? 'మమ్మల్ని అనుసరించండి' : 'Follow Us';
  const footerMotto = isTelugu ? 'మంచి రేపటి కోసం ఐక్యంగా.' : 'United for a better tomorrow.';
  const addressLine = isTelugu ? '123 యూనియన్ లేన్, వర్కర్స్ సిటీ, 500001' : "123 Union Lane, Worker's City, 500001";
  const emailText = isTelugu ? 'ఇమెయిల్:' : 'Email:';
  const phoneText = isTelugu ? 'ఫోన్:' : 'Phone:';

  return (
    <footer className="bg-secondary text-foreground">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href={homeLink} className="flex items-center gap-2 font-bold text-xl font-headline">
              <Users className="h-7 w-7 text-primary" />
              Sanghika Samakhya
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{footerMotto}</p>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider uppercase">{quickLinksText}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href={benefitsLink} className="hover:text-primary transition-colors">{benefitsText}</Link></li>
              <li><Link href={pricingLink} className="hover:text-primary transition-colors">{pricingText}</Link></li>
              <li><Link href={dashboardLink} className="hover:text-primary transition-colors">{dashboardText}</Link></li>
              <li><Link href={contactLink} className="hover:text-primary transition-colors">{contactUsText}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider uppercase">{contactText}</h3>
            <address className="mt-4 space-y-2 text-sm not-italic text-muted-foreground">
              <p>{addressLine}</p>
              <p>{emailText} <a href="mailto:contact@sanghika.org" className="hover:text-primary transition-colors">contact@sanghika.org</a></p>
              <p>{phoneText} <a href="tel:+911234567890" className="hover:text-primary transition-colors">+91 123 456 7890</a></p>
            </address>
          </div>
           <div>
            <h3 className="font-semibold tracking-wider uppercase">{followUsText}</h3>
            <div className="mt-4 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram /></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sanghika Samakhya. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
