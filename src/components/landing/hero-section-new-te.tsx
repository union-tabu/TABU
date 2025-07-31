
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSectionTe() {
  return (
    <section className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 py-12 sm:py-16 lg:py-20 items-center min-h-[600px]">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-6 lg:space-y-8 order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              యూనియన్‌లో చేరండి. మీ భవిష్యత్తును భద్రపరచండి.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
              తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్‌లో సభ్యులుగా నమోదు చేసుకుని, అధికారిక గుర్తింపు కార్డు, భీమా ప్రయోజనాలు, మరియు మీకు అత్యంత అవసరమైనప్పుడు మద్దతును పొందండి. ప్రారంభించడానికి కేవలం కొన్ని నిమిషాలు మాత్రమే పడుతుంది.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg">
                <Link href="/te/signup">నమోదు చేసుకోండి</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/te/login">సైన్ ఇన్</Link>
              </Button>
            </div>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2">
            <Image 
              src="/logo.png" 
              alt="Telangana All Building Workers Union Logo"
              width={500}
              height={500}
              className="w-full h-auto rounded-lg shadow-sm"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
