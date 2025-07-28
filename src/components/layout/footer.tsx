
"use client";

import Link from 'next/link';
import { Twitter, Facebook, Instagram } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isTelugu = pathname.startsWith('/te');

  const homeLink = isTelugu ? '/te' : '/';
  const aboutLink = isTelugu ? '/te#about' : '#about';
  const benefitsLink = isTelugu ? '/te#benefits' : '#benefits';
  const faqLink = isTelugu ? '/te#faq' : '#faq';

  const aboutText = isTelugu ? 'మా గురించి' : 'About';
  const benefitsText = isTelugu ? 'ప్రయోజనాలు' : 'Benefits';
  const faqText = isTelugu ? 'FAQ' : 'FAQ';
  const copyrightText = isTelugu ? '© 2024 తెలంగాణ బిల్డింగ్ వర్కర్స్ యూనియన్. అన్ని హక్కులూ ప్రత్యేకించుకోవడమైనది.' : '© 2024 Telangana Building Workers Union. All rights reserved.';
  
  return (
    <footer className="bg-background text-foreground border-t">
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                <span>Telangana All Building Workers Union</span>
            </div>
            <nav className="flex gap-6 text-sm font-medium">
                <Link href={aboutLink} className="hover:text-primary/80 transition-colors">{aboutText}</Link>
                <Link href={benefitsLink} className="hover:text-primary/80 transition-colors">{benefitsText}</Link>
                <Link href={faqLink} className="hover:text-primary/80 transition-colors">{faqText}</Link>
            </nav>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary/80 transition-colors"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary/80 transition-colors"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary/80 transition-colors"><Instagram /></Link>
            </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
