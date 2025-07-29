
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
              <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-base font-medium">
                <Link href="/te/signup">నమోదు చేసుకోండి</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-gray-700 px-8 py-3 text-base font-medium border border-gray-300 hover:border-gray-400">
                <Link href="/te/login">సైన్ ఇన్</Link>
              </Button>
            </div>
          </div>
          
          {/* Image placeholder */}
          <div className="order-1 lg:order-2">
            <div data-ai-hint="construction worker" className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] bg-gray-200 rounded-lg shadow-sm"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
