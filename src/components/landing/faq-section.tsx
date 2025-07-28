
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
    <section id="faq" className="w-full py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-start">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Have questions about joining the union or how it works? Here are answers to the most common queries to help you get started with confidence.
            </p>
          </div>
          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index+1}`} key={index}>
                  <AccordionTrigger className="text-lg font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
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
