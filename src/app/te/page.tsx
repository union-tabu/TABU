
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Check, HeartHandshake, Megaphone, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd check a token or session.
    // For this prototype, we'll simulate it with localStorage.
    if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
    }
  }, []);

  const handlePlanSelection = (planUrl: string) => {
    if (isAuthenticated) {
      router.push(planUrl);
    } else {
      router.push('/te/login');
    }
  };


  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-secondary flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container px-4 md:px-6 z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary-foreground font-headline">
              సంఘిక సమాఖ్యకు స్వాగతం
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              మంచి హక్కులు, మంచి జీతం, మరియు మంచి భవిష్యత్తు కోసం కలిసి నిలబడదాం. ఐక్యతలోనే మన బలం ఉంది.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform transform hover:scale-105">
                <Link href="/te/signup">ఈరోజే యూనియన్‌లో చేరండి <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground font-headline">మాతో ఎందుకు చేరాలి?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              సంఘిక సమాఖ్యలో సభ్యత్వం మీ పని జీవితాన్ని రక్షించడానికి మరియు మెరుగుపరచడానికి అనేక ప్రయోజనాలను అందిస్తుంది.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">చట్టపరమైన రక్షణ</CardTitle>
              </CardHeader>
              <CardContent>
                <p>పనికి సంబంధించిన సమస్యల కోసం చట్టపరమైన సలహా మరియు ప్రాతినిధ్యం పొందండి.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">సామూహిక బేరసారాలు</CardTitle>
              </CardHeader>
              <CardContent>
                <p>మీ తరపున మెరుగైన వేతనాలు, ప్రయోజనాలు మరియు పని పరిస్థితుల కోసం మేము చర్చలు జరుపుతాము.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <HeartHandshake className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">సామాజిక మద్దతు</CardTitle>
              </CardHeader>
              <CardContent>
                <p>సంఘీభావం మరియు పరస్పర మద్దతు కోసం తోటి కార్మికుల నెట్‌వర్క్‌లో చేరండి.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Megaphone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">బలమైన గొంతుక</CardTitle>
              </CardHeader>
              <CardContent>
                <p>కలిసికట్టుగా, మార్పు మరియు న్యాయం కోసం వాదించడానికి మాకు శక్తివంతమైన గొంతు ఉంది.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="w-full py-16 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground font-headline">సభ్యత్వ ప్రణాళికలు</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              మీకు సరిపోయే ప్రణాళికను ఎంచుకోండి. అన్ని ప్రణాళికలు పూర్తి ప్రయోజనాలను అందిస్తాయి.
            </p>
          </div>
          <div className="mt-16 mx-auto grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-2">
            <Card className="flex flex-col rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-headline">నెలవారీ ప్రణాళిక</CardTitle>
                <CardDescription className="mt-2 text-4xl font-bold text-primary">₹50<span className="text-lg font-medium text-muted-foreground">/నెల</span></CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-8">
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />పూర్తి సభ్యత్వ ప్రయోజనాలు</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />సౌకర్యవంతమైన నిబద్ధత</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />ఆటోమేటిక్ పునరుద్ధరణ</li>
                </ul>
              </CardContent>
              <CardFooter className="p-8">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handlePlanSelection('/te/signup?plan=monthly')}>
                  నెలవారీ ఎంచుకోండి
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex flex-col rounded-2xl border-2 border-accent shadow-2xl hover:scale-105 transition-transform duration-300 relative">
              <div className="absolute top-0 right-4 -mt-4">
                <div className="bg-accent text-accent-foreground text-sm font-semibold py-1 px-3 rounded-full">అత్యంత ప్రాచుర్యం</div>
              </div>
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-headline">వార్షిక ప్రణాళిక</CardTitle>
                <CardDescription className="mt-2 text-4xl font-bold text-primary">₹600<span className="text-lg font-medium text-muted-foreground">/సంవత్సరం</span></CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-8">
                 <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />పూర్తి సభ్యత్వ ప్రయోజనాలు</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />వార్షిక చందాపై ఆదా చేసుకోండి</li>
                  <li className="flex items-center"><Check className="h-5 w-5 text-accent mr-2" />ఒకసారి సెట్ చేసి మర్చిపోండి</li>
                </ul>
              </CardContent>
              <CardFooter className="p-8">
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handlePlanSelection('/te/signup?plan=yearly')}>
                  వార్షిక ఎంచుకోండి
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground font-headline">మా సభ్యుల నుండి</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              యూనియన్ ప్రభావం గురించి మా సభ్యులు ఏమి చెబుతున్నారో వినండి.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="p-6 shadow-md">
              <CardContent className="flex flex-col">
                <p className="text-muted-foreground italic">"యూనియన్ నాకు మాట్లాడటానికి ధైర్యాన్ని ఇచ్చింది. వారి మద్దతుతో, మేము సైట్‌లోని ప్రతిఒక్కరికీ మెరుగైన భద్రతా పరికరాలను పొందాము."</p>
                <div className="mt-4 flex items-center">
                  <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male worker" alt="సభ్యుని ఫోటో" />
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold text-primary-foreground">రవి కుమార్</p>
                    <p className="text-sm text-muted-foreground">నిర్మాణ కార్మికుడు</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-md">
              <CardContent className="flex flex-col">
                <p className="text-muted-foreground italic">"నా జీతం అన్యాయంగా కోత విధించినప్పుడు, యూనియన్ లీగల్ టీమ్ జోక్యం చేసుకుని రోజుల్లోనే పరిష్కరించింది. నేను చాలా కృతజ్ఞురాలిని."</p>
                <div className="mt-4 flex items-center">
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="female worker" alt="సభ్యుని ఫోటో" />
                    <AvatarFallback>SP</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold text-primary-foreground">సునీతా పటేల్</p>
                    <p className="text-sm text-muted-foreground">గార్మెంట్ ఫ్యాక్టరీ ఉద్యోగి</p>
                  </div>
                </div>
              </CardContent>
            </Card>
             <Card className="p-6 shadow-md">
              <CardContent className="flex flex-col">
                <p className="text-muted-foreground italic">"యూనియన్‌లో భాగం కావడం అంటే నేను ఒంటరిని కాదు. ఇది పనిలో మరియు బయట మిమ్మల్ని చూసుకునే కుటుంబం."</p>
                <div className="mt-4 flex items-center">
                   <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="male employee" alt="సభ్యుని ఫోటో" />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold text-primary-foreground">అనిల్ జోషి</p>
                    <p className="text-sm text-muted-foreground">లాజిస్టిక్స్ సిబ్బంది</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-16 md:py-24 bg-secondary">
        <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground font-headline">సంప్రదించండి</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              మేము సహాయం చేయడానికి ఇక్కడ ఉన్నాము. ఏవైనా ప్రశ్నలు లేదా ఆందోళనలతో మమ్మల్ని సంప్రదించండి.
            </p>
            <div className="mt-8 text-lg text-foreground">
              <p><strong>చిరునామా:</strong> 123 యూనియన్ లేన్, వర్కర్స్ సిటీ, 500001</p>
              <p className="mt-2"><strong>ఫోన్:</strong> +91 123 456 7890</p>
              <p className="mt-2"><strong>ఇమెయిల్:</strong> contact@sanghika.org</p>
            </div>
        </div>
      </section>
    </div>
  );
}
