
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { ConfirmationResult, linkWithCredential, EmailAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';

const FAKE_EMAIL_DOMAIN = "@sanghika.samakhya";

export default function VerifyFormTe() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [signupData, setSignupData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('signupFormDataTe');
    if (!storedData) {
      toast({ title: 'నమోదు లోపం', description: 'నమోదు డేటా కనుగొనబడలేదు. దయచేసి మళ్ళీ ప్రారంభించండి.', variant: 'destructive' });
      router.push('/te/signup');
    } else {
      setSignupData(JSON.parse(storedData));
    }
  }, [router, toast]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!/^\d{6}$/.test(formData.otp)) errors.otp = 'OTP 6 అంకెలు ఉండాలి';
    if (formData.password.length < 8) errors.password = 'పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (formErrors[id]) setFormErrors(prev => ({ ...prev, [id]: '' }));
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || !signupData) return;
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult as ConfirmationResult | undefined;
      if (!confirmationResult) {
        throw new Error("OTP నిర్ధారణ సెషన్ గడువు ముగిసింది. దయచేసి మళ్ళీ నమోదు చేయడానికి ప్రయత్నించండి.");
      }

      const userCredential = await confirmationResult.confirm(formData.otp);
      const user = userCredential.user;

      const email = `${signupData.phone}${FAKE_EMAIL_DOMAIN}`;
      const credential = EmailAuthProvider.credential(email, formData.password);
      await linkWithCredential(user, credential);
      
      await setDoc(doc(db, "users", user.uid), {
        fullName: signupData.fullName,
        phone: signupData.phone,
        addressLine: signupData.address,
        city: signupData.city,
        state: signupData.state,
        pinCode: signupData.pin,
        createdAt: new Date(),
        subscription: { status: 'not subscribed' },
        email: ''
      });
      
      // Auto-login after successful registration
      await signInWithEmailAndPassword(auth, email, formData.password);

      sessionStorage.removeItem('signupFormDataTe');
      toast({ title: 'ఖాతా సృష్టించబడింది!', description: 'డాష్‌బోర్డ్‌కు మళ్ళిస్తున్నాము...' });
      router.push('/te/dashboard');

    } catch (error: any) {
      console.error("Signup Error:", error);
      let errorMessage = "ఊహించని లోపం సంభవించింది.";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "మీరు నమోదు చేసిన OTP తప్పుగా ఉంది. దయచేసి తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "OTP గడువు ముగిసింది. దయచేసి వెనుకకు వెళ్లి మళ్ళీ ప్రయత్నించండి.";
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = "ఈ ఖాతా ఇప్పటికే మరొక వినియోగదారునికి లింక్ చేయబడింది. దయచేసి సైన్అప్ ప్రక్రియను మళ్ళీ ప్రారంభించండి.";
      }
      toast({ title: "నమోదు విఫలమైంది", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!signupData) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">ధృవీకరించి & పాస్‌వర్డ్ సృష్టించండి</CardTitle>
          <CardDescription>{signupData.phone}కు పంపిన OTPని నమోదు చేసి, మీ పాస్‌వర్డ్‌ను సెట్ చేయండి.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSignup}>
            <div className="grid gap-2">
              <Label htmlFor="otp">OTPని నమోదు చేయండి *</Label>
              <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} className={formErrors.otp ? 'border-red-500' : ''}/>
              {formErrors.otp && <p className="text-xs text-red-500">{formErrors.otp}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">పాస్‌వర్డ్‌ను సెట్ చేయండి *</Label>
              <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} className={formErrors.password ? 'border-red-500' : ''}/>
              {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">పాస్‌వర్డ్‌ను నిర్ధారించండి *</Label>
              <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword} className={formErrors.confirmPassword ? 'border-red-500' : ''}/>
              {formErrors.confirmPassword && <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'ఖాతా సృష్టిస్తోంది...' : 'ఖాతాను సృష్టించండి'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            తప్పు వివరాలు నమోదు చేశారా?{' '}
            <Link href="/te/signup" className="underline hover:text-primary">
              వెనుకకు వెళ్ళండి
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
