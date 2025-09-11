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
                <p className="text-sm text-muted-foreground">अंतिम अपडेट: 5 अगस्त, 2024</p>
             </CardHeader>
             <CardContent className="space-y-8 text-lg text-gray-700">
                <p>
                तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन (TABU) में आपका स्वागत है। सदस्य बनकर, आप निम्नलिखित नियमों और शर्तों का पालन करने के लिए सहमत हैं। यह संघ मुख्य रूप से निर्माण श्रमिकों के अधिकारों की रक्षा के लिए स्थापित किया गया है।
                </p>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">1. संघ के उद्देश्य</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>बिल्डरों, ठेकेदारों और कंपनियों के साथ बेहतर मजदूरी और श्रमिक लाभों के लिए बातचीत करना।</li>
                        <li>यदि किसी श्रमिक को उचित भुगतान नहीं मिलता है या मजदूरी से संबंधित समस्याओं का सामना करना पड़ता है, तो संघ हस्तक्षेप करेगा और उनके अधिकारों के लिए लड़ेगा।</li>
                        <li>श्रमिकों और उनके परिवारों द्वारा सामना की जाने वाली दुर्घटनाओं, चिकित्सा आवश्यकताओं या अन्य अचानक समस्याओं के मामले में सहायता प्रदान करना।</li>
                        <li>सामूहिक सौदेबाजी की शक्ति सुनिश्चित करना, ताकि किसी भी श्रमिक को कम भुगतान या शोषण का सामना न करना पड़े।</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">2. सदस्यता और बकाया</h2>
                    <p><strong>पात्रता:</strong> तेलंगाना में भवन और निर्माण क्षेत्र में काम करने वाला कोई भी व्यक्ति सदस्यता के लिए पात्र है।</p>
                    <p><strong>बकाया:</strong> प्रत्येक श्रमिक को लाभ प्राप्त करना जारी रखने के लिए अपनी मासिक या वार्षिक सदस्यता शुल्क का भुगतान करना होगा। बकाया राशि का भुगतान न करने पर आपकी सदस्यता निलंबित हो सकती है।</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">3. सदस्य की जिम्मेदारियां</h2>
                     <p>श्रमिकों को मजदूरी वार्ता के लिए व्यक्तिगत रूप से ठेकेदारों या बिल्डरों से संपर्क नहीं करना चाहिए। इसके बजाय, उन्हें सभी सदस्यों के लिए उचित मजदूरी और समान व्यवहार सुनिश्चित करने के लिए संघ के माध्यम से काम करना चाहिए।</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">4. संघ की मजदूरी सिफारिशें</h2>
                    <p>संघ सभी भवन श्रमिकों के लिए उचित मजदूरी के लिए लड़ना जारी रखेगा। संघ मानकों के अनुसार, अनुशंसित मासिक मजदूरी हैं:</p>
                     <ul className="list-disc pl-6 space-y-2">
                        <li><strong>राजमिस्त्री:</strong> ₹12,000 प्रति माह</li>
                        <li><strong>मिडियम (कुशल कारीगर):</strong> ₹10,000 प्रति माह</li>
                        <li><strong>सहायक:</strong> ₹8,000 प्रति माह</li>
                        <li><strong>नया कार्यकर्ता:</strong> ₹7,000 प्रति माह</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">5. समाप्ति</h2>
                    <p>यदि आप इन शर्तों का उल्लंघन करते हैं या संघ के उद्देश्यों के लिए हानिकारक आचरण में संलग्न होते हैं तो हम आपकी सदस्यता को निलंबित या समाप्त करने का अधिकार सुरक्षित रखते हैं। आप हमसे संपर्क करके किसी भी समय अपनी सदस्यता रद्द कर सकते हैं।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">6. शर्तों में परिवर्तन</h2>
                    <p>हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं। हम इस पृष्ठ पर नई शर्तों को पोस्ट करके किसी भी बदलाव के बारे में आपको सूचित करेंगे।</p>
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
