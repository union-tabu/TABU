"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RefundAndCancellationPageTe() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
           <Card className="max-w-4xl mx-auto shadow-lg">
             <CardHeader>
                <h1 className="text-4xl font-bold text-gray-900 font-headline">వాపసు మరియు రద్దు విధానం</h1>
                <p className="text-sm text-muted-foreground">చివరిగా నవీకరించబడింది: ఆగస్టు 5, 2024</p>
             </CardHeader>
             <CardContent className="space-y-6 text-lg text-gray-700">
                <p>
                తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్ (TABU)లో సభ్యుడిగా ఉన్నందుకు ధన్యవాదాలు. ఈ విధానం మీ సభ్యత్వ చందా వాపసు మరియు రద్దుకు సంబంధించిన నిబంధనలను వివరిస్తుంది.
                </p>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">1. సభ్యత్వ రుసుములు</h2>
                    <p>TABUకు చెల్లించిన అన్ని సభ్యత్వ చందా రుసుములు వాపసు చేయబడవు. వసూలు చేసిన రుసుములు యూనియన్ కార్యకలాపాలకు, సభ్యులకు మద్దతు సేవలకు మరియు పరిపాలనా ఖర్చులకు నిధులు సమకూర్చడానికి ఉపయోగించబడతాయి.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">2. సభ్యత్వం రద్దు</h2>
                    <p>మీరు ఎప్పుడైనా మీ సభ్యత్వాన్ని రద్దు చేసుకోవచ్చు. రద్దు చేయడానికి, దయచేసి మా <a href="/te/contact" className="text-primary hover:underline">మమ్మల్ని సంప్రదించండి</a> పేజీలో అందించిన సమాచారం ద్వారా మా మద్దతు బృందాన్ని సంప్రదించండి. దయచేసి మీ సభ్యత్వాన్ని రద్దు చేయడం వల్ల ఇప్పటికే చెల్లించిన ఏ రుసుముకూ వాపసు రాదని గమనించండి, ప్రస్తుత చందా కాలానికి (నెలవారీ లేదా వార్షిక) కూడా.</p>
                    <p>రద్దు చేసిన తర్వాత, మీ సభ్యత్వం మీ ప్రస్తుత చెల్లించిన చందా కాలం ముగిసే వరకు చురుకుగా ఉంటుంది. ఆ తర్వాత, మీకు సభ్యులకు మాత్రమే అందుబాటులో ఉండే ప్రయోజనాలకు ప్రాప్యత ఉండదు.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">3. దామాషా వాపసులు లేవు</h2>
                    <p>మీ చందా కాలం యొక్క ఉపయోగించని ఏ భాగానికైనా మేము దామాషా వాపసులను అందించము, మీకు నెలవారీ లేదా వార్షిక ప్రణాళిక ఉన్నా. ఒకసారి చెల్లింపు జరిగిన తర్వాత, అది అంతిమమైనది.</p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">4. ఈ విధానంలో మార్పులు</h2>
                    <p>
                    మేము ఈ వాపసు మరియు రద్దు విధానాన్ని ఎప్పుడైనా సవరించే హక్కును కలిగి ఉన్నాము. ఏవైనా మార్పులు ఈ పేజీలో పోస్ట్ చేయబడతాయి. అటువంటి మార్పుల తర్వాత మా సేవలను మీరు నిరంతరం ఉపయోగించడం కొత్త విధానాన్ని మీరు అంగీకరించినట్లుగా పరిగణించబడుతుంది.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-primary mb-3 font-headline">మమ్మల్ని సంప్రదించండి</h2>
                    <p>
                    ఈ విధానం గురించి మీకు ఏవైనా ప్రశ్నలు ఉంటే, దయచేసి <a href="/te/contact" className="text-primary hover:underline">మమ్మల్ని సంప్రదించండి</a>.
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
