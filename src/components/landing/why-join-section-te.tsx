
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IndianRupee, ShieldCheck, FileText } from 'lucide-react';

const benefits = [
  {
    icon: <IndianRupee className="h-8 w-8" />,
    title: 'ఆర్థిక సహాయం',
    description: 'ఏదైనా అనుకోని సంఘటన జరిగితే మీ కుటుంబానికి వెంటనే ₹10,000 సహాయం అందుతుంది. అత్యంత అవసరమైన సమయంలో మేము మీ ప్రియమైన వారికి అండగా ఉంటాము.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: 'మీ సమస్యలకు సహాయం',
    description: "మీరు చేసిన పనికి జీతం రాకపోతే, మీ హక్కుగా రావలసిన జీతాన్ని చట్టపరమైన మరియు సంఘం మద్దతు ద్వారా తిరిగి పొందడంలో యూనియన్ సహాయం చేస్తుంది.",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'అధికారిక యూనియన్ ఐడి',
    description: 'తెలంగాణ వ్యాప్తంగా యజమానులు మరియు కాంట్రాక్టర్లతో విశ్వాసాన్ని పెంచే ధృవీకరించబడిన యూనియన్ ఐడిని పొందండి.',
  },
];

export function WhyJoinSectionTe() {
  return (
    <section id="benefits" className="w-full bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              యూనియన్‌లో ఎందుకు చేరాలి?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              తెలంగాణ బిల్డింగ్ వర్కర్స్ యూనియన్‌లో సభ్యత్వం మీకు కేవలం ఒక ఐడి కంటే ఎక్కువ ఇస్తుంది. ఇది మీకు విశ్వాసం మరియు మనశ్శాంతితో పనిచేయడానికి సహాయపడటానికి రక్షణ, మద్దతు మరియు గుర్తింపును అందిస్తుంది.
            </p>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className={`
                  text-left group bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200
                  ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}
                `}
              >
                <CardContent className="flex flex-col items-start p-0">
                  <div className="mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
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
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/te/signup">నమోదు చేసుకోండి</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
