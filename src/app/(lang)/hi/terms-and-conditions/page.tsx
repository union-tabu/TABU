"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TermsAndConditionsPageHi() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <Card className="max-w-4xl mx-auto shadow-lg">
             <CardHeader>
                <h1 className="text-4xl font-bold text-gray-900 font-headline">नियम और शर्तें</h1>
                <p className="text-sm text-muted-foreground">अंतिम अपडेट: 4 अगस्त, 2024</p>
             </CardHeader>
             <CardContent className="space-y-6 text-lg text-gray-700">
                <p>
                तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन (TABU) में आपका स्वागत है। हमारी वेबसाइट तक पहुँचने और हमारी सेवाओं का उपयोग करके, आप निम्नलिखित नियमों और शर्तों का पालन करने और उनसे बाध्य होने के लिए सहमत हैं। कृपया उनकी सावधानीपूर्वक समीक्षा करें।
                </p>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">1. सदस्यता</h2>
                    <p><strong>पात्रता:</strong> तेलंगाना में भवन और निर्माण क्षेत्र में काम करने वाला कोई भी व्यक्ति सदस्यता के लिए पात्र है।</p>
                    <p><strong>पंजीकरण:</strong> सदस्य बनने के लिए, आपको पंजीकरण प्रक्रिया पूरी करनी होगी, सटीक जानकारी प्रदान करनी होगी, और लागू सदस्यता शुल्क का भुगतान करना होगा।</p>
                    <p><strong>बकाया:</strong> सदस्यों को सक्रिय स्थिति बनाए रखने के लिए सदस्यता शुल्क (मासिक या वार्षिक) का भुगतान करना आवश्यक है। बकाया का भुगतान न करने पर आपकी सदस्यता और संबंधित लाभों का निलंबन या समाप्ति हो सकती है।</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">2. सेवाओं का उपयोग</h2>
                    <p>आप हमारी सेवाओं का उपयोग केवल कानूनी उद्देश्यों के लिए करने के लिए सहमत हैं। आप अपने खाते के तहत होने वाली सभी गतिविधियों के लिए जिम्मेदार हैं। आप सेवा का उपयोग इसके लिए नहीं करने के लिए सहमत हैं:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>किसी अन्य व्यक्ति को परेशान करना, दुर्व्यवहार करना, या नुकसान पहुँचाना।</li>
                        <li>गलत या भ्रामक जानकारी प्रदान करना।</li>
                        <li>किसी भी ऐसी गतिविधि में संलग्न होना जो हमारी सेवाओं को बाधित या हस्तक्षेप करती है।</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">3. समाप्ति</h2>
                    <p>यदि आप इन शर्तों का उल्लंघन करते हैं या संघ या उसके सदस्यों के लिए हानिकारक आचरण में संलग्न होते हैं, तो हम अपने विवेक पर आपकी सदस्यता को निलंबित या समाप्त करने का अधिकार सुरक्षित रखते हैं। आप हमसे संपर्क करके किसी भी समय अपनी सदस्यता समाप्त कर सकते हैं।</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">4. वारंटियों का अस्वीकरण</h2>
                    <p>हमारी सेवाएं "जैसी हैं" और "जैसी उपलब्ध हैं" के आधार पर बिना किसी प्रकार की वारंटी के प्रदान की जाती हैं, चाहे वह व्यक्त हो या निहित। हम यह वारंटी नहीं देते कि सेवाएं निर्बाध या त्रुटि मुक्त होंगी।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">5. देयता की सीमा</h2>
                    <p>तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन, उसके निदेशक, और उसके प्रतिनिधि हमारी सेवाओं के आपके उपयोग से उत्पन्न होने वाले किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, या परिणामी नुकसान के लिए उत्तरदायी नहीं होंगे।</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">6. शर्तों में परिवर्तन</h2>
                    <p>हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं। हम इस पेज पर नई शर्तों को पोस्ट करके किसी भी बदलाव के बारे में आपको सूचित करेंगे। ऐसे किसी भी बदलाव के बाद सेवा का आपका निरंतर उपयोग नई शर्तों की आपकी स्वीकृति का गठन करता है।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">7. शासी कानून</h2>
                    <p>ये शर्तें तेलंगाना, भारत के कानूनों के अनुसार शासित और मानी जाएंगी, इसके कानून के प्रावधानों के टकराव की परवाह किए बिना।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">हमसे संपर्क करें</h2>
                    <p>यदि इन नियमों और शर्तों के बारे में आपके कोई प्रश्न हैं, तो कृपया <a href="/hi/contact" className="text-primary hover:underline">हमसे संपर्क करें</a>।</p>
                </div>
             </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
