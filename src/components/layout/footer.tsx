
"use client";

import Link from 'next/link';
import { Twitter, Facebook, Instagram, HardHat } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isTelugu = pathname.startsWith('/te');

  const homeLink = isTelugu ? '/te' : '/';
  const aboutLink = isTelugu ? '/te#about' : '/#about';
  const benefitsLink = isTelugu ? '/te#benefits' : '/#benefits';
  const faqLink = isTelugu ? '/te#faq' : '/#faq';

  const aboutText = isTelugu ? 'మా గురించి' : 'About';
  const benefitsText = isTelugu ? 'ప్రయోజనాలు' : 'Benefits';
  const faqText = isTelugu ? 'FAQ' : 'FAQ';
  const copyrightText = isTelugu ? 
    '© 2024 తెలంగాణ బిల్డింగ్ వర్కర్స్ యూనియన్. అన్ని హక్కులూ ప్రత్యేకించుకోవడమైనది.' : 
    '© 2024 Telangana Building Workers Union. All rights reserved.';
  
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start md:items-center">
            {/* Logo and brand */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <HardHat className="w-8 h-8 text-primary" />
                <span className="text-lg font-bold text-gray-900 leading-tight">
                  Telangana All Building Workers Union
                </span>
              </div>
            </div>
            
            {/* Navigation links */}
            <nav className="flex flex-wrap gap-6 md:justify-center">
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
            </nav>
            
            {/* Social links */}
            <div className="flex space-x-4 md:justify-end">
              <Link 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
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
