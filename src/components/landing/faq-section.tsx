"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "Who can join the Telangana All Building Workers Union?",
        answer: "Any worker involved in building and construction work in Telangana is eligible to join the union, including daily wage laborers, masons, carpenters, plumbers, electricians, and more."
    },
    {
        question: "What documents do I need to register?",
        answer: "You will typically need a government-issued photo ID (like an Aadhaar card), proof of address, and details about your work. The specific requirements will be outlined during the signup process."
    },
    {
        question: "What happens if I don't pay for 2 months?",
        answer: "Your membership might become inactive if dues are not paid. However, we have processes to help you reactivate your membership. Please contact our support team for assistance."
    },
    {
        question: "What benefits do I get as a member?",
        answer: "Members get access to financial support in case of accidents, legal help for wage disputes, an official union ID for recognition, and become part of a supportive community of fellow workers."
    },
    {
        question: "How do I renew my membership?",
        answer: "You can renew your membership by logging into your account on our website and going to the 'Subscription' tab. You can choose to renew monthly or annually through secure online payment options."
    }
];

export function FaqSection() {
  return (
    <section id="faq" className="w-full bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Frequently Asked Questions
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
