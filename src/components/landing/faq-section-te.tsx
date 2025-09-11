"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";

const faqs = [
    {
        question: "తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్‌లో ఎవరు చేరవచ్చు?",
        answer: "తెలంగాణలో భవన మరియు నిర్మాణ పనులలో పాలుపంచుకునే ఏ కార్మికుడైనా యూనియన్‌లో చేరడానికి అర్హులు, రోజువారీ కూలీలు, మేస్త్రీలు, వడ్రంగులు, ప్లంబర్లు, ఎలక్ట్రీషియన్లు, మరియు మరిన్ని."
    },
    {
        question: "నేను 2 నెలలు చెల్లించకపోతే ఏమి జరుగుతుంది?",
        answer: "సభ్యత్వ రుసుములు చెల్లించకపోతే మీ సభ్యత్వం నిష్క్రియం కావచ్చు. అయితే, మీ సభ్యత్వాన్ని పునఃప్రారంభించడానికి మీకు సహాయపడటానికి మా వద్ద ప్రక్రియలు ఉన్నాయి. దయచేసి సహాయం కోసం మా మద్దతు బృందాన్ని సంప్రదించండి."
    },
    {
        question: "సభ్యుడిగా నాకు ఏ ప్రయోజనాలు లభిస్తాయి?",
        answer: "సభ్యులు ప్రమాదాల సందర్భంలో ఆర్థిక సహాయం, వేతన వివాదాల కోసం చట్టపరమైన సహాయం, గుర్తింపు కోసం అధికారిక యూనియన్ ఐడి, మరియు తోటి కార్మికుల మద్దతు గల సంఘంలో భాగమవుతారు. మరిన్ని వివరాల కోసం, దయచేసి మా "
    },
    {
        question: "నా సభ్యత్వాన్ని నేను ఎలా పునరుద్ధరించుకోవాలి?",
        answer: "మీరు మా వెబ్‌సైట్‌లో మీ ఖాతాకు లాగిన్ అయి, 'సభ్యత్వం' ట్యాబ్‌కు వెళ్లడం ద్వారా మీ సభ్యత్వాన్ని పునరుద్ధరించుకోవచ్చు. మీరు సురక్షిత ఆన్‌లైన్ చెల్లింపు ఎంపికల ద్వారా నెలవారీ లేదా వార్షికంగా పునరుద్ధరించుకోవడానికి ఎంచుకోవచ్చు."
    }
];

export function FaqSectionTe() {
  return (
    <section id="faq" className="w-full bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                తరచుగా అడిగే ప్రశ్నలు
              </h2>
            </div>
            
            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  value={`item-${index+1}`} 
                  key={index}
                  className="bg-white rounded-lg border px-6"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-800 hover:text-gray-900 py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600 leading-relaxed pb-4">
                    {faq.answer}
                    {faq.question === "సభ్యుడిగా నాకు ఏ ప్రయోజనాలు లభిస్తాయి?" && (
                        <Link href="/te/terms-and-conditions" className="text-primary hover:underline">నిబంధనలు మరియు షరతులు చూడండి.</Link>
                    )}
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
