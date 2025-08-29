"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RefundAndCancellationPageHi() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
           <Card className="max-w-4xl mx-auto shadow-lg">
             <CardHeader>
                <h1 className="text-4xl font-bold text-gray-900 font-headline">धनवापसी और रद्दीकरण नीति</h1>
                <p className="text-sm text-muted-foreground">अंतिम अपडेट: 5 अगस्त, 2024</p>
             </CardHeader>
             <CardContent className="space-y-6 text-lg text-gray-700">
                <p>
                तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन (TABU) के सदस्य होने के लिए धन्यवाद। यह नीति आपकी सदस्यता के धनवापसी और रद्दीकरण से संबंधित शर्तों को रेखांकित करती है।
                </p>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">1. सदस्यता शुल्क</h2>
                    <p>TABU को भुगतान किए गए सभी सदस्यता शुल्क गैर-वापसी योग्य हैं। एकत्र किए गए शुल्क का उपयोग संघ की गतिविधियों, सदस्यों के लिए समर्थन सेवाओं और प्रशासनिक लागतों को कवर करने के लिए किया जाता है।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">2. सदस्यता रद्द करना</h2>
                    <p>आप किसी भी समय अपनी सदस्यता रद्द करना चुन सकते हैं। रद्द करने के लिए, कृपया हमारे <a href="/hi/contact" className="text-primary hover:underline">संपर्क करें</a> पृष्ठ पर दी गई जानकारी के माध्यम से हमारी सहायता टीम से संपर्क करें। कृपया ध्यान दें कि आपकी सदस्यता रद्द करने से पहले से भुगतान किए गए किसी भी शुल्क की वापसी नहीं होगी, जिसमें वर्तमान सदस्यता अवधि (मासिक या वार्षिक) भी शामिल है।</p>
                    <p>रद्दीकरण के बाद, आपकी सदस्यता आपकी वर्तमान भुगतान की गई सदस्यता अवधि के अंत तक सक्रिय रहेगी। उसके बाद, आपको केवल सदस्यों के लिए उपलब्ध लाभों तक पहुंच नहीं होगी।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">3. कोई आनुपातिक धनवापसी नहीं</h2>
                    <p>हम आपकी सदस्यता अवधि के किसी भी अप्रयुक्त हिस्से के लिए आनुपातिक धनवापसी की पेशकश नहीं करते हैं, चाहे आपकी मासिक या वार्षिक योजना हो। एक बार भुगतान हो जाने के बाद, यह अंतिम होता है।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">4. इस नीति में परिवर्तन</h2>
                    <p>
                    हम किसी भी समय इस धनवापसी और रद्दीकरण नीति को संशोधित करने का अधिकार सुरक्षित रखते हैं। कोई भी परिवर्तन इस पृष्ठ पर पोस्ट किया जाएगा। ऐसे किसी भी परिवर्तन के बाद हमारी सेवाओं का आपका निरंतर उपयोग नई नीति की आपकी स्वीकृति का गठन करता है।
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">हमसे संपर्क करें</h2>
                    <p>
                    यदि इस नीति के बारे में आपके कोई प्रश्न हैं, तो कृपया <a href="/hi/contact" className="text-primary hover:underline">हमसे संपर्क करें</a>।
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
