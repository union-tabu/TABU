"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TermsAndConditionsPageTe() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <Card className="max-w-4xl mx-auto shadow-lg">
             <CardHeader>
                <h1 className="text-4xl font-bold text-gray-900 font-headline">నిబంధనలు మరియు షరతులు</h1>
                <p className="text-sm text-muted-foreground">చివరిగా నవీకరించబడింది: ఆగస్టు 5, 2024</p>
             </CardHeader>
             <CardContent className="space-y-8 text-lg text-gray-700">
                <p>
                తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్ (TABU)కి స్వాగతం. సభ్యులుగా మారడం ద్వారా, మీరు ఈ క్రింది నిబంధనలు మరియు షరతులకు కట్టుబడి ఉండటానికి అంగీకరిస్తున్నారు. ఈ యూనియన్ ప్రధానంగా నిర్మాణ కార్మికుల హక్కులను పరిరక్షించడానికి స్థాపించబడింది.
                </p>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">1. యూనియన్ లక్ష్యాలు</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>బిల్డర్లు, కాంట్రాక్టర్లు మరియు కంపెనీలతో మెరుగైన వేతనాలు మరియు కార్మిక ప్రయోజనాల కోసం చర్చలు జరపడం.</li>
                        <li>ఒక కార్మికుడికి సరిగ్గా చెల్లించకపోయినా లేదా వేతనాలతో సమస్యలు ఎదుర్కొన్నా, యూనియన్ జోక్యం చేసుకుని వారి హక్కుల కోసం పోరాడుతుంది.</li>
                        <li>ప్రమాదాలు, వైద్య అవసరాలు, లేదా కార్మికులు మరియు వారి కుటుంబాలు ఎదుర్కొనే ఇతర ఆకస్మిక సమస్యల సందర్భంలో మద్దతు అందించడం.</li>
                        <li>ఏ కార్మికుడికీ తక్కువ జీతం ఇవ్వకుండా లేదా దోపిడీకి గురికాకుండా సామూహిక బేరసారాల శక్తిని నిర్ధారించడం.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">2. సభ్యత్వం మరియు రుసుములు</h2>
                    <p><strong>అర్హత:</strong> తెలంగాణలోని భవన మరియు నిర్మాణ రంగంలో పనిచేస్తున్న ఏ వ్యక్తి అయినా సభ్యత్వం కోసం అర్హులు.</p>
                    <p><strong>రుసుములు:</strong> ప్రయోజనాలను కొనసాగించడానికి ప్రతి కార్మికుడు తమ నెలవారీ లేదా వార్షిక సభ్యత్వ రుసుములను చెల్లించాలి. రుసుములు చెల్లించడంలో విఫలమైతే మీ సభ్యత్వం సస్పెండ్ చేయబడవచ్చు.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">3. సభ్యుని బాధ్యతలు</h2>
                     <p>కార్మికులు వేతన చర్చల కోసం వ్యక్తిగతంగా కాంట్రాక్టర్లు లేదా బిల్డర్లను సంప్రదించకూడదు. బదులుగా, వారు సభ్యులందరికీ న్యాయమైన వేతనాలు మరియు సమాన చికిత్సను నిర్ధారించడానికి యూనియన్ ద్వారా పనిచేయాలి.</p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">4. యూనియన్ వేతన సిఫార్సులు</h2>
                    <p>యూనియన్ భవన కార్మికులందరికీ న్యాయమైన వేతనాల కోసం పోరాడుతూనే ఉంటుంది. యూనియన్ ప్రమాణాల ప్రకారం, సిఫార్సు చేయబడిన నెలవారీ వేతనాలు:</p>
                     <ul className="list-disc pl-6 space-y-2">
                        <li><strong>మేస్త్రీ:</strong> నెలకు ₹12,000</li>
                        <li><strong>మీడియం (నైపుణ్యం కలిగిన కార్మికుడు):</strong> నెలకు ₹10,000</li>
                        <li><strong>సహాయకుడు:</strong> నెలకు ₹8,000</li>
                        <li><strong>కొత్త కార్మికుడు:</strong> నెలకు ₹7,000</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">5. రద్దు</h2>
                    <p>మీరు ఈ నిబంధనలను ఉల్లంఘించినా లేదా యూనియన్ లక్ష్యాలకు హానికరం అయిన ప్రవర్తనలో నిమగ్నమైతే, మీ సభ్యత్వాన్ని సస్పెండ్ చేయడానికి లేదా రద్దు చేయడానికి మాకు హక్కు ఉంది. మమ్మల్ని సంప్రదించడం ద్వారా మీరు ఎప్పుడైనా మీ సభ్యత్వాన్ని రద్దు చేసుకోవచ్చు.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">6. నిబంధనలలో మార్పులు</h2>
                    <p>ఈ నిబంధనలను ఎప్పుడైనా సవరించే హక్కు మాకు ఉంది. ఈ పేజీలో కొత్త నిబంధనలను పోస్ట్ చేయడం ద్వారా ఏవైనా మార్పుల గురించి మేము మీకు తెలియజేస్తాము.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">మమ్మల్ని సంప్రదించండి</h2>
                    <p>ఈ నిబంధనలు మరియు షరతుల గురించి మీకు ఏవైనా ప్రశ్నలు ఉంటే, దయచేసి <a href="/te/contact" className="text-primary hover:underline">మమ్మల్ని సంప్రదించండి</a>.</p>
                </div>
             </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
