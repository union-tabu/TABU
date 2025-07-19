
"use client";

import { HeroSection } from '@/components/landing/hero-section';
import { BenefitsSection } from '@/components/landing/benefits-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { ContactSection } from '@/components/landing/contact-section';

export default function HomeTe() {
  return (
    <div className="flex flex-col">
      <HeroSection
        title="సంఘిక సమాఖ్యకు స్వాగతం"
        subtitle="మంచి హక్కులు, మంచి జీతం, మరియు మంచి భవిష్యత్తు కోసం కలిసి నిలబడదాం. ఐక్యతలోనే మన బలం ఉంది."
        buttonText="ఈరోజే యూనియన్‌లో చేరండి"
        buttonLink="/te/signup"
      />
      <BenefitsSection
        title="మాతో ఎందుకు చేరాలి?"
        subtitle="సంఘిక సమాఖ్యలో సభ్యత్వం మీ పని జీవితాన్ని రక్షించడానికి మరియు మెరుగుపరచడానికి అనేక ప్రయోజనాలను అందిస్తుంది."
        benefits={[
          {
            title: 'చట్టపరమైన రక్షణ',
            description: 'పనికి సంబంధించిన సమస్యల కోసం చట్టపరమైన సలహా మరియు ప్రాతినిధ్యం పొందండి.',
            icon: 'ShieldCheck'
          },
          {
            title: 'సామూహిక బేరసారాలు',
            description: 'మీ తరపున మెరుగైన వేతనాలు, ప్రయోజనాలు మరియు పని పరిస్థితుల కోసం మేము చర్చలు జరుపుతాము.',
            icon: 'Users'
          },
          {
            title: 'సామాజిక మద్దతు',
            description: 'సంఘీభావం మరియు పరస్పర మద్దతు కోసం తోటి కార్మికుల నెట్‌వర్క్‌లో చేరండి.',
            icon: 'HeartHandshake'
          },
          {
            title: 'బలమైన గొంతుక',
            description: 'కలిసికట్టుగా, మార్పు మరియు న్యాయం కోసం వాదించడానికి మాకు శక్తివంతమైన గొంతు ఉంది.',
            icon: 'Megaphone'
          }
        ]}
      />
      <PricingSection
        title="సభ్యత్వ ప్రణాళికలు"
        subtitle="మీకు సరిపోయే ప్రణాళికను ఎంచుకోండి. అన్ని ప్రణాళికలు పూర్తి ప్రయోజనాలను అందిస్తాయి."
        monthlyPlan={{
          title: 'నెలవారీ ప్రణాళిక',
          price: '₹50',
          period: '/నెల',
          features: ['పూర్తి సభ్యత్వ ప్రయోజనాలు', 'సౌకర్యవంతమైన నిబద్ధత', 'ఆటోమేటిక్ పునరుద్ధరణ'],
          buttonText: 'నెలవారీ ఎంచుకోండి'
        }}
        yearlyPlan={{
          title: 'వార్షిక ప్రణాళిక',
          price: '₹600',
          period: '/సంవత్సరం',
          features: ['పూర్తి సభ్యత్వ ప్రయోజనాలు', 'వార్షిక చందాపై ఆదా చేసుకోండి', 'ఒకసారి సెట్ చేసి మర్చిపోండి'],
          buttonText: 'వార్షిక ఎంచుకోండి',
          popularText: 'అత్యంత ప్రాచుర్యం',
          popular: true
        }}
      />
      <TestimonialsSection
        title="మా సభ్యుల నుండి"
        subtitle="యూనియన్ ప్రభావం గురించి మా సభ్యులు ఏమి చెబుతున్నారో వినండి."
        testimonials={[
          {
            quote: `"యూనియన్ నాకు మాట్లాడటానికి ధైర్యాన్ని ఇచ్చింది. వారి మద్దతుతో, మేము సైట్‌లోని ప్రతిఒక్కరికీ మెరుగైన భద్రతా పరికరాలను పొందాము."`,
            name: 'రవి కుమార్',
            role: 'నిర్మాణ కార్మికుడు',
            avatar: 'https://placehold.co/40x40.png',
            avatarHint: 'male worker',
            fallback: 'RK',
            altText: 'సభ్యుని ఫోటో'
          },
          {
            quote: `"నా జీతం అన్యాయంగా కోత విధించినప్పుడు, యూనియన్ లీగల్ టీమ్ జోక్యం చేసుకుని రోజుల్లోనే పరిష్కరించింది. నేను చాలా కృతజ్ఞురాలిని."`,
            name: 'సునీతా పటేల్',
            role: 'గార్మెంట్ ఫ్యాక్టరీ ఉద్యోగి',
            avatar: 'https://placehold.co/40x40.png',
            avatarHint: 'female worker',
            fallback: 'SP',
            altText: 'సభ్యుని ఫోటో'
          },
          {
            quote: `"యూనియన్‌లో భాగం కావడం అంటే నేను ఒంటరిని కాదు. ఇది పనిలో మరియు బయట మిమ్మల్ని చూసుకునే కుటుంబం."`,
            name: 'అనిల్ జోషి',
            role: 'లాజిస్టిక్స్ సిబ్బంది',
            avatar: 'https://placehold.co/40x40.png',
            avatarHint: 'male employee',
            fallback: 'AJ',
            altText: 'సభ్యుని ఫోటో'
          }
        ]}
      />
      <ContactSection
        title="సంప్రదించండి"
        subtitle="మేము సహాయం చేయడానికి ఇక్కడ ఉన్నాము. ఏవైనా ప్రశ్నలు లేదా ఆందోళనలతో మమ్మల్ని సంప్రదించండి."
        address="123 యూనియన్ లేన్, వర్కర్స్ సిటీ, 500001"
        phone="+91 123 456 7890"
        email="contact@sanghika.org"
      />
    </div>
  );
}
