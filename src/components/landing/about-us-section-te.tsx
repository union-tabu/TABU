
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutUsSectionTe() {
  return (
    <section id="about" className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-start">
            {/* Left side - Image placeholder */}
            <div className="order-2 lg:order-1">
              <div data-ai-hint="construction workers" className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg shadow-sm"></div>
            </div>
            
            {/* Right side - Content */}
            <div className="order-1 lg:order-2 flex flex-col justify-center space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                మా గురించి
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-base sm:text-lg">
                  తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్ అనేది తెలంగాణ వ్యాప్తంగా ఉన్న రోజువారీ కూలీలు, నిర్మాణ కార్మికులు, మరియు నైపుణ్యం కలిగిన పనివారల సముదాయం, వారి హక్కులు మరియు శ్రేయస్సును పరిరక్షించడానికి ఏకమయ్యారు.
                </p>
                
                <p className="text-base sm:text-lg">
                  ప్రతి కార్మికుడికి గుర్తింపు, గౌరవం, మరియు భీమా మరియు ఆర్థిక సహాయం వంటి అవసరమైన ప్రయోజనాలను అందించడానికి మేము కట్టుబడి ఉన్నాము. యూనియన్‌తో నమోదు చేసుకోవడం ద్వారా, కార్మికులు అధికారిక గుర్తింపు, వేతనాల రికవరీ కోసం మద్దతు వ్యవస్థ, మరియు అత్యవసర పరిస్థితులలో వారి కుటుంబాలకు రక్షణ పొందుతారు.
                </p>
                
                <p className="text-base sm:text-lg">
                  మీరు ఒక గ్రామంలో లేదా నగరంలో ఒక సైట్‌లో పనిచేస్తున్నా, ఈ యూనియన్ మీ గొంతు, మీ బలం, మరియు మీ భద్రతా వలయం.
                </p>
              </div>
              
              <div className="pt-4">
                <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-base font-medium">
                  <Link href="/te/signup">నమోదు చేసుకోండి</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
