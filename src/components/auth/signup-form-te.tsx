
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

// =================================================================================
// ముఖ్యమైన ఫైర్‌బేస్ కాన్ఫిగరేషన్ గమనిక
// =================================================================================
// OTP పంపేటప్పుడు `auth/internal-error` నివారించడానికి, మీరు పరీక్షించే డొమైన్‌ను
// (ఉదా., localhost) ఫైర్‌బేస్ కన్సోల్‌లో తప్పనిసరిగా అధీకృతం చేయాలి.
//
// ఎలా పరిష్కరించాలి:
// 1. మీ ఫైర్‌బేస్ కన్సోల్‌కు వెళ్లండి.
// 2. మీ ప్రాజెక్ట్‌ను ఎంచుకోండి.
// 3. "Authentication" -> "Settings" -> "Authorized domains"కు వెళ్లండి.
// 4. "Add domain" క్లిక్ చేసి, డొమైన్‌ను నమోదు చేయండి (ఉదా., `localhost` స్థానికంగా పరీక్షిస్తుంటే).
// =================================================================================

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const FAKE_EMAIL_DOMAIN = "@sanghika.samakhya";

export default function SignupFormTe() {
  const router = useRouter();
  const { toast: shadToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
 
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    otp: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    country: 'భారతదేశం',
    pin: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };


  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        toast.error('దయచేసి చెల్లుబాటు అయ్యే 10-అంకెల భారతీయ ఫోన్ నంబర్‌ను నమోదు చేయండి.');
        setLoading(false);
        return;
    }
    
    try {
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
      });
      
      const fullPhoneNumber = `+91${formData.phone}`;
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setOtpSent(true);
      toast.success('OTP విజయవంతంగా పంపబడింది!');
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = 'OTP పంపడంలో విఫలమైంది. దయచేసి తర్వాత ప్రయత్నించండి.';
      if (error.code === 'auth/too-many-requests') {
          errorMessage = 'చాలా ఎక్కువ అభ్యర్థనలు. దయచేసి తర్వాత ప్రయత్నించండి.';
      } else if (error.code === 'auth/internal-error') {
          errorMessage = "అంతర్గత లోపం. దయచేసి మీ డొమైన్ (ఉదా., 'localhost') ఫైర్‌బేస్ కన్సోల్ యొక్క ప్రామాణీకరణ సెట్టింగ్‌లలో అధీకృతం చేయబడిందని నిర్ధారించుకోండి.";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
     if (formData.password !== formData.confirmPassword) {
        toast.error("పాస్‌వర్డ్‌లు సరిపోలడం లేదు.");
        return;
    }
    setLoading(true);

    try {
        const confirmationResult = window.confirmationResult;
        if (!confirmationResult) {
            throw new Error("OTP ధృవీకరించబడలేదు.");
        }

        await confirmationResult.confirm(formData.otp);
        
        const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
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
            },
            email: '' // Add email field
        });
        
        // No toast here, redirect will show it
        router.push('/te/login?registered=true');

    } catch (error: any)        {
        console.error("Signup Error:", error);
        let errorMessage = "తెలియని లోపం సంభవించింది.";
        if (error.code === 'auth/invalid-verification-code') {
            errorMessage = "OTP తప్పుగా ఉంది. దయచేసి తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = "ఈ ఫోన్ నంబర్ ఇప్పటికే నమోదు చేయబడింది. దయచేసి బదులుగా లాగిన్ చేయండి.";
        } else if (error.code === 'auth/code-expired') {
            errorMessage = "OTP గడువు ముగిసింది. దయచేసి కొత్తదాన్ని అభ్యర్థించండి.";
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
                      <Input id="phone" type="tel" placeholder="9876543210" required onChange={handleInputChange} value={formData.phone} disabled={otpSent}/>
                  </div>
              </div>

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
                      <Input id="country" placeholder="భారతదేశం" required onChange={handleInputChange} value={formData.country} disabled={true}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="pin">పిన్</Label>
                      <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin} disabled={otpSent}/>
                  </div>
              </div>
              
              {otpSent && (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="otp">OTPని నమోదు చేయండి</Label>
                        <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">పాస్‌వర్డ్</Label>
                            <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">పాస్‌వర్డ్‌ను నిర్ధారించండి</Label>
                            <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword} />
                        </div>
                    </div>
                </>
              )}
              
              <div id="recaptcha-container"></div>
              
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
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
    </div>
  );
}
