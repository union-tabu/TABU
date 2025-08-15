"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन में कौन शामिल हो सकता है?",
        answer: "तेलंगाना में भवन और निर्माण कार्य में शामिल कोई भी श्रमिक संघ में शामिल होने के लिए पात्र है, जिसमें दिहाड़ी मजदूर, राजमिस्त्री, बढ़ई, प्लंबर, इलेक्ट्रीशियन और बहुत कुछ शामिल हैं।"
    },
    {
        question: "पंजीकरण के लिए मुझे किन दस्तावेजों की आवश्यकता है?",
        answer: "आपको आमतौर पर एक सरकार द्वारा जारी फोटो आईडी (जैसे आधार कार्ड), पते का प्रमाण और आपके काम के बारे में विवरण की आवश्यकता होगी। पंजीकरण प्रक्रिया के दौरान विशिष्ट आवश्यकताओं को रेखांकित किया जाएगा।"
    },
    {
        question: "अगर मैं 2 महीने तक भुगतान नहीं करता तो क्या होगा?",
        answer: "यदि बकाया का भुगतान नहीं किया जाता है तो आपकी सदस्यता निष्क्रिय हो सकती है। हालांकि, हमारे पास आपकी सदस्यता को फिर से सक्रिय करने में मदद करने के लिए प्रक्रियाएं हैं। कृपया सहायता के लिए हमारी सहायता टीम से संपर्क करें।"
    },
    {
        question: "एक सदस्य के रूप में मुझे क्या लाभ मिलते हैं?",
        answer: "सदस्यों को दुर्घटनाओं के मामले में वित्तीय सहायता, मजदूरी विवादों के लिए कानूनी मदद, मान्यता के लिए एक आधिकारिक संघ आईडी, और साथी श्रमिकों के एक सहायक समुदाय का हिस्सा बनने का अवसर मिलता है।"
    },
    {
        question: "मैं अपनी सदस्यता का नवीनीकरण कैसे करूं?",
        answer: "आप हमारी वेबसाइट पर अपने खाते में लॉग इन करके और 'सदस्यता' टैब पर जाकर अपनी सदस्यता का नवीनीकरण कर सकते हैं। आप सुरक्षित ऑनलाइन भुगतान विकल्पों के माध्यम से मासिक या वार्षिक रूप से नवीनीकरण करना चुन सकते हैं।"
    }
];

export function FaqSectionHi() {
  return (
    <section id="faq" className="w-full bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                अक्सर पूछे जाने वाले प्रश्न
              </h2>
            </div>
            
            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  value={`item-${index+1}`} 
                  key={index}
                  className="bg-white rounded-lg shadow-sm px-6"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-800 hover:text-gray-900 py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600 leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
