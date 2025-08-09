
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function Footer() {
  const pathname = usePathname();
  const isTelugu = pathname.startsWith('/te');

  const homeLink = isTelugu ? '/te' : '/';
  const aboutLink = isTelugu ? '/te#about' : '/#about';
  const benefitsLink = isTelugu ? '/te#benefits' : '/#benefits';
  const faqLink = isTelugu ? '/te#faq' : '/#faq';
  const contactLink = isTelugu ? '/te/contact' : '/contact';
  const privacyLink = isTelugu ? '/te/privacy-policy' : '/privacy-policy';
  const termsLink = isTelugu ? '/te/terms-and-conditions' : '/terms-and-conditions';

  const aboutText = isTelugu ? 'మా గురించి' : 'About';
  const benefitsText = isTelugu ? 'ప్రయోజనాలు' : 'Benefits';
  const faqText = isTelugu ? 'FAQ' : 'FAQ';
  const contactText = isTelugu ? 'సంప్రదించండి' : 'Contact';
  const privacyText = isTelugu ? 'గోప్యతా విధానం' : 'Privacy Policy';
  const termsText = isTelugu ? 'నిబంధనలు & షరతులు' : 'Terms & Conditions';
  
  const copyrightText = isTelugu ? 
    '© 2025 తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్. అన్ని హక్కులూ ప్రత్యేకించుకోవడమైనది.' : 
    '© 2025 Telangana All Building Workers Union. All rights reserved.';
  
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Logo and brand */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto" />
                <span className="text-lg font-bold text-gray-900 leading-tight">
                  TABU
                </span>
              </div>
            </div>
            
            {/* Navigation links */}
            <nav className="flex flex-wrap gap-x-6 gap-y-4 md:justify-end">
               <Link 
                href={aboutLink} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {aboutText}
              </Link>
              <Link 
                href={benefitsLink} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {benefitsText}
              </Link>
              <Link 
                href={faqLink} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {faqText}
              </Link>
              <Link 
                href={contactLink} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {contactText}
              </Link>
               <Link 
                href={privacyLink} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {privacyText}
              </Link>
               <Link 
                href={termsLink} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {termsText}
              </Link>
            </nav>
            
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              {copyrightText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
