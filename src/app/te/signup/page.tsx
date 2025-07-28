
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { add } from 'date-fns';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'భారతదేశం',
    pin: '',
  });

  const [otp, setOtp] = useState('');

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {}
    });

    return () => {
        window.recaptchaVerifier?.clear();
    };
}, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
        const formattedPhone = `+91${formData.phone}`;
        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier!);
        window.confirmationResult = confirmationResult;
        setStep('otp');
        toast({
          title: "ధృవీకరణ కోడ్ పంపబడింది",
          description: "దయచేసి మీ ఫోన్‌కు పంపిన కోడ్‌ను నమోదు చేయండి.",
        });
    } catch (error: any) {
        console.error("OTP Send Error:", error);
        toast({
            title: "కోడ్ పంపడంలో లోపం",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
        const userCredential: UserCredential = await window.confirmationResult.confirm(otp);
        const user = userCredential.user;

        const plan = searchParams.get('plan') || 'yearly';
        const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });
        
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: null,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pin}`,
            createdAt: new Date(),
            subscription: {
                plan: plan,
                status: 'active',
                renewalDate: renewalDate,
            }
        });
        
        toast({
            title: "ఖాతా సృష్టించబడింది!",
            description: "మీరు విజయవంతంగా నమోదు చేసుకున్నారు.",
        });

        router.push('/te/dashboard');

    } catch (error: any) {
        console.error("Signup Error:", error);
        toast({
            title: "నమోదు విఫలమైంది",
            description: "ధృవీకరణ కోడ్ తప్పు లేదా మరో లోపం సంభవించింది.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  }


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-2xl w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">కొత్త ఖాతాను సృష్టించండి</CardTitle>
          <CardDescription>
            {step === 'details' 
              ? "ఖాతాను సృష్టించడానికి మీ సమాచారాన్ని నమోదు చేయండి." 
              : "నమోదు పూర్తి చేయడానికి మీ ఫోన్‌కు పంపిన OTPని నమోదు చేయండి."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form className="grid gap-4" onSubmit={handleSendOtp}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="fullName">పూర్తి పేరు</Label>
                      <Input id="fullName" placeholder="పేరు ఇంటిపేరు" required onChange={handleInputChange} value={formData.fullName} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="phone">ఫోన్</Label>
                      <Input id="phone" type="tel" placeholder="987-654-3210" required onChange={handleInputChange} value={formData.phone}/>
                  </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">చిరునామా</Label>
                <Input id="address" placeholder="11-2-333, ల్యాండ్‌మార్క్" required onChange={handleInputChange} value={formData.address} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="city">నగరం</Label>
                      <Input id="city" placeholder="హైదరాబాద్" required onChange={handleInputChange} value={formData.city}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="state">రాష్ట్రం</Label>
                      <Input id="state" placeholder="తెలంగాణ" required onChange={handleInputChange} value={formData.state}/>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="country">దేశం</Label>
                      <Input id="country" placeholder="భారతదేశం" required onChange={handleInputChange} value={formData.country}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="pin">పిన్</Label>
                      <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin}/>
                  </div>
              </div>
              
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? 'OTP పంపుతోంది...' : 'ధృవీకరణ కోడ్ పంపండి'}
              </Button>
            </form>
          ) : (
             <form className="grid gap-4" onSubmit={handleVerifyOtpAndSignup}>
                <div className="grid gap-2">
                    <Label htmlFor="otp">ధృవీకరణ కోడ్</Label>
                    <Input
                        id="otp"
                        type="text"
                        placeholder="6-అంకెల కోడ్‌ను నమోదు చేయండి"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                    {loading ? 'ధృవీకరిస్తోంది...' : 'ఖాతాను సృష్టించండి'}
                </Button>
                <Button variant="link" onClick={() => setStep('details')}>వివరాలకు తిరిగి వెళ్ళు</Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            ఇప్పటికే ఖాతా ఉందా?{' '}
            <Link href="/te/login" className="underline hover:text-primary">
              లాగిన్
            </Link>
          </div>
        </CardContent>
      </Card>
      <div id="recaptcha-container"></div>
    </div>
  );
}
