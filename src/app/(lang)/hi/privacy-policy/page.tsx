"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function PrivacyPolicyPageHi() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <Card className="max-w-4xl mx-auto shadow-lg">
             <CardHeader>
                <h1 className="text-4xl font-bold text-gray-900 font-headline">गोपनीयता नीति</h1>
                <p className="text-sm text-muted-foreground">अंतिम अपडेट: 4 अगस्त, 2024</p>
             </CardHeader>
             <CardContent className="space-y-6 text-lg text-gray-700">
                <p>
                तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन ("हम," "हमारा," या "हमें") आपकी गोपनीयता की रक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट और सेवाओं का उपयोग करते हैं तो हम आपकी जानकारी कैसे एकत्र, उपयोग, खुलासा और सुरक्षित करते हैं।
                </p>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">हम जो जानकारी एकत्र करते हैं</h2>
                    <p>हम आपसे विभिन्न तरीकों से व्यक्तिगत जानकारी एकत्र कर सकते हैं, जिनमें शामिल हैं:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>व्यक्तिगत पहचान जानकारी:</strong> नाम, फ़ोन नंबर, पता, शहर, राज्य, पिन कोड, पेशा, और प्रोफ़ाइल चित्र जो आप खाता पंजीकृत करते समय प्रदान करते हैं।</li>
                        <li><strong>वित्तीय जानकारी:</strong> सदस्यता सेवाओं के लिए भुगतान जानकारी, जिसे हमारे तीसरे पक्ष के भुगतान गेटवे, रेज़रपे के माध्यम से संसाधित किया जाता है। हम आपके पूरे कार्ड विवरण संग्रहीत नहीं करते हैं।</li>
                        <li><strong>संदर्भ जानकारी:</strong> यदि आपको किसी अन्य सदस्य द्वारा संदर्भित किया जाता है, तो हम संदर्भकर्ता का फ़ोन नंबर एकत्र करते हैं।</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">हम आपकी जानकारी का उपयोग कैसे करते हैं</h2>
                    <p>हम एकत्र की गई जानकारी का उपयोग इसके लिए करते हैं:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>आपका खाता बनाने और प्रबंधित करने के लिए।</li>
                        <li>आपको हमारी सेवाएं प्रदान करने के लिए, जिसमें यूनियन आईडी जारी करना शामिल है।</li>
                        <li>आपके सदस्यता भुगतान और नवीनीकरण को संसाधित करने के लिए।</li>
                        <li>आपके खाते या हमारी सेवाओं के बारे में आपसे संवाद करने के लिए।</li>
                        <li>समर्थन प्रदान करने और विवादों को हल करने के लिए।</li>
                        <li>कानूनी दायित्वों का पालन करने के लिए।</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">आपकी जानकारी साझा करना</h2>
                    <p>हम आपकी व्यक्तिगत रूप से पहचान योग्य जानकारी को बाहरी पार्टियों को बेचते, व्यापार या अन्यथा स्थानांतरित नहीं करते हैं, सिवाय निम्नलिखित स्थितियों के:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>सेवा प्रदाताओं के साथ:</strong> हम तीसरे पक्ष के विक्रेताओं, जैसे रेज़रपे, के साथ जानकारी साझा करते हैं, जो हमारे लिए या हमारी ओर से सेवाएं करते हैं, जैसे भुगतान प्रसंस्करण।</li>
                        <li><strong>कानूनी कारणों से:</strong> हम आपकी जानकारी का खुलासा कर सकते हैं यदि कानून द्वारा ऐसा करना आवश्यक हो या सार्वजनिक प्राधिकरणों के वैध अनुरोधों के जवाब में।</li>
                    </ul>
                    <p className="pt-2">हमारी वेबसाइट पर सदस्यों की सूची जनता से आपकी गोपनीयता की रक्षा के लिए केवल आपका नाम, शहर और एक छिपा हुआ फ़ोन नंबर प्रदर्शित करती है।</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">आपकी जानकारी की सुरक्षा</h2>
                    <p>
                    हम आपकी व्यक्तिगत जानकारी की सुरक्षा में मदद करने के लिए प्रशासनिक, तकनीकी और भौतिक सुरक्षा उपायों का उपयोग करते हैं। जबकि हमने आपके द्वारा हमें प्रदान की गई व्यक्तिगत जानकारी को सुरक्षित करने के लिए उचित कदम उठाए हैं, कृपया ध्यान रखें कि हमारे प्रयासों के बावजूद, कोई भी सुरक्षा उपाय सही या अभेद्य नहीं हैं।
                    </p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">आपके अधिकार</h2>
                    <p>
                    आपको हमारी वेबसाइट पर अपने प्रोफ़ाइल पेज के माध्यम से किसी भी समय अपनी व्यक्तिगत जानकारी तक पहुंचने और उसे अपडेट करने का अधिकार है। आप हमारे कानूनी और संविदात्मक दायित्वों के अधीन, हमसे संपर्क करके अपने खाते को हटाने का अनुरोध भी कर सकते हैं।
                    </p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">इस गोपनीयता नीति में परिवर्तन</h2>
                    <p>
                    हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। हम इस पेज पर नई गोपनीयता नीति पोस्ट करके किसी भी बदलाव के बारे में आपको सूचित करेंगे। आपको किसी भी बदलाव के लिए समय-समय पर इस गोपनीयता नीति की समीक्षा करने की सलाह दी जाती है।
                    </p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">हमसे संपर्क करें</h2>
                    <p>
                    यदि इस गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं, तो कृपया <a href="/hi/contact" className="text-primary hover:underline">हमसे संपर्क करें</a>।
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
