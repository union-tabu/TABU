
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function SignupFormTe() {
  const router = useRouter();
  const { toast: shadToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
 
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    otp: '',
    address: '',
    city: '',
    state: '',
    country: 'భారతదేశం',
    pin: '',
  });

  useEffect(() => {
    return () => {
      window.recaptchaVerifier?.clear();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };

  const generateRecaptcha = () => {
     if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {}
      });
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    generateRecaptcha();
    
    const appVerifier = window.recaptchaVerifier!;
    const fullPhoneNumber = `+91${formData.phone}`;

    try {
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setOtpSent(true);
      toast.success('OTP విజయవంతంగా పంపబడింది!');
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error('OTP పంపడంలో విఫలమైంది. దయచేసి ఫోన్ నంబర్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.');
      window.recaptchaVerifier?.clear();
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
        const confirmationResult = window.confirmationResult;
        if (!confirmationResult) {
            throw new Error("OTP not verified.");
        }

        const userCredential = await confirmationResult.confirm(formData.otp);
        const user = userCredential.user;

        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pin}`,
            createdAt: new Date(),
            subscription: {
                status: 'not subscribed',
            }
        });
        
        shadToast({
            title: "ఖాతా సృష్టించబడింది!",
            description: "స్వాగతం! మీ ఖాతా సిద్ధంగా ఉంది. దయచేసి మీ సభ్యత్వాన్ని సక్రియం చేయడానికి సభ్యత్వాన్ని పొందండి.",
        });

        localStorage.setItem('isAuthenticated', 'true');
        router.push('/te/subscribe');

    } catch (error: any) {
        console.error("Signup Error:", error);
        let errorMessage = "తెలియని లోపం సంభవించింది.";
        if (error.code === 'auth/invalid-verification-code') {
            errorMessage = "OTP తప్పుగా ఉంది. దయచేసి తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
        } else if (error.code === 'auth/credential-already-in-use') {
            errorMessage = "ఈ ఫోన్ నంబర్ ఇప్పటికే నమోదు చేయబడింది. దయచేసి బదులుగా లాగిన్ చేయండి.";
        }
        shadToast({
            title: "నమోదు విఫలమైంది",
            description: errorMessage,
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
            ఖాతాను సృష్టించడానికి మీ సమాచారాన్ని నమోదు చేయండి.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form className="grid gap-4" onSubmit={otpSent ? handleSignup : handleSendOtp}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="fullName">పూర్తి పేరు</Label>
                      <Input id="fullName" placeholder="పేరు ఇంటిపేరు" required onChange={handleInputChange} value={formData.fullName} disabled={otpSent}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="phone">ఫోన్</Label>
                      <Input id="phone" type="tel" placeholder="987-654-3210" required onChange={handleInputChange} value={formData.phone} disabled={otpSent}/>
                  </div>
              </div>
              
              {otpSent && (
                  <div className="grid gap-2">
                      <Label htmlFor="otp">OTPని నమోదు చేయండి</Label>
                      <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} />
                  </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="address">చిరునామా</Label>
                <Input id="address" placeholder="11-2-333, ల్యాండ్‌మార్క్" required onChange={handleInputChange} value={formData.address} disabled={otpSent}/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="city">నగరం</Label>
                      <Input id="city" placeholder="హైదరాబాద్" required onChange={handleInputChange} value={formData.city} disabled={otpSent}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="state">రాష్ట్రం</Label>
                      <Input id="state" placeholder="తెలంగాణ" required onChange={handleInputChange} value={formData.state} disabled={otpSent}/>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="country">దేశం</Label>
                      <Input id="country" placeholder="భారతదేశం" required onChange={handleInputChange} value={formData.country} disabled={otpSent}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="pin">పిన్</Label>
                      <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin} disabled={otpSent}/>
                  </div>
              </div>
              
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {otpSent
                    ? (loading ? 'ఖాతా సృష్టిస్తోంది...' : 'ఖాతాను సృష్టించండి')
                    : (loading ? 'OTP పంపుతోంది...' : 'OTP పంపండి')
                }
              </Button>
            </form>
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
