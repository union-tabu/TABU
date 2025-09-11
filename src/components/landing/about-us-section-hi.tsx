
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image';

export function AboutUsSectionHi() {
  return (
    <section id="about" className="w-full bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-start">
            {/* Left side - Image */}
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="max-w-lg">
                <Image 
                    src="/about-sec.jpg" 
                    alt="निर्माण श्रमिक सहयोग कर रहे हैं"
                    width={500}
                    height={450}
                    className="w-full h-auto object-cover rounded-lg shadow-lg"
                  />
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="order-1 lg:order-2 flex flex-col justify-center space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                हमारे बारे में
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-base sm:text-lg">
                  तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन तेलंगाना भर में दिहाड़ी मजदूरों, निर्माण श्रमिकों और कुशल कारीगरों का एक समूह है, जो अपने अधिकारों और कल्याण की रक्षा के लिए एकजुट हुए हैं।
                </p>
                
                <p className="text-base sm:text-lg">
                  हम प्रत्येक कार्यकर्ता को पहचान, सम्मान और बीमा और वित्तीय सहायता जैसे आवश्यक लाभों तक पहुंच के साथ सशक्त बनाने के लिए प्रतिबद्ध हैं। संघ के साथ पंजीकरण करके, श्रमिकों को आधिकारिक मान्यता, मजदूरी वसूली के लिए एक समर्थन प्रणाली और आपात स्थिति के मामले में उनके परिवारों के लिए सुरक्षा मिलती है।
                </p>
                
                <p className="text-base sm:text-lg">
                  चाहे आप किसी गांव में या शहर में किसी साइट पर काम कर रहे हों, यह संघ आपकी आवाज, आपकी ताकत और आपका सुरक्षा जाल है।
                </p>
              </div>
              
              <div className="pt-4">
                <Button asChild size="lg">
                  <Link href="/hi/signup">पंजीकरण करें</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
