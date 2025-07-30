
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function SignupFormTe() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'భారతదేశం',
    pin: '',
  });

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errors.fullName = 'పూర్తి పేరు అవసరం';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = 'దయచేసి చెల్లుబాటు అయ్యే 10-అంకెల భారతీయ ఫోన్ నంబర్‌ను నమోదు చేయండి';
    if (!formData.address.trim()) errors.address = 'చిరునామా అవసరం';
    if (!formData.city.trim()) errors.city = 'నగరం అవసరం';
    if (!formData.state.trim()) errors.state = 'రాష్ట్రం అవసరం';
    if (!/^\d{6}$/.test(formData.pin)) errors.pin = 'పిన్ కోడ్ 6 అంకెలు ఉండాలి';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (formErrors[id]) setFormErrors(prev => ({ ...prev, [id]: '' }));
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const phoneExists = await checkPhoneExists(formData.phone);
      if (phoneExists) {
        toast({
          title: 'ఫోన్ నంబర్ ఇప్పటికే నమోదు చేయబడింది',
          description: 'ఈ ఫోన్ నంబర్‌తో ఖాతా ఇప్పటికే ఉంది. దయచేసి లాగిన్ చేయండి.',
          variant: 'destructive',
        });
        router.push('/te/login');
        return;
      }

      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const fullPhoneNumber = `+91${formData.phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      
      sessionStorage.setItem('signupFormDataTe', JSON.stringify(formData));
      window.confirmationResult = confirmationResult;

      toast({ title: 'OTP విజయవంతంగా పంపబడింది!', description: `కోడ్ +91${formData.phone}కు పంపబడింది` });
      router.push('/te/verify');

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({ title: 'OTP పంపడంలో విఫలమైంది', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-2xl w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">కొత్త ఖాతాను సృష్టించండి</CardTitle>
          <CardDescription>ఖాతాను సృష్టించడానికి మీ సమాచారాన్ని నమోదు చేయండి.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSendOtp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">పూర్తి పేరు *</Label>
                <Input id="fullName" placeholder="పేరు ఇంటిపేరు" required onChange={handleInputChange} value={formData.fullName} className={formErrors.fullName ? 'border-red-500' : ''} />
                {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">ఫోన్ *</Label>
                <Input id="phone" type="tel" placeholder="9876543210" required onChange={handleInputChange} value={formData.phone} maxLength={10} className={formErrors.phone ? 'border-red-500' : ''} />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">చిరునామా *</Label>
              <Input id="address" placeholder="11-2-333, ల్యాండ్‌మార్క్" required onChange={handleInputChange} value={formData.address} className={formErrors.address ? 'border-red-500' : ''} />
              {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">నగరం *</Label>
                <Input id="city" placeholder="హైదరాబాద్" required onChange={handleInputChange} value={formData.city} className={formErrors.city ? 'border-red-500' : ''} />
                {formErrors.city && <p className="text-xs text-red-500">{formErrors.city}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">రాష్ట్రం *</Label>
                <Input id="state" placeholder="తెలంగాణ" required onChange={handleInputChange} value={formData.state} className={formErrors.state ? 'border-red-500' : ''} />
                {formErrors.state && <p className="text-xs text-red-500">{formErrors.state}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">దేశం</Label>
                <Input id="country" value={formData.country} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pin">పిన్ *</Label>
                <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin} maxLength={6} className={formErrors.pin ? 'border-red-500' : ''} />
                {formErrors.pin && <p className="text-xs text-red-500">{formErrors.pin}</p>}
              </div>
            </div>
            <div id="recaptcha-container"></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'OTP పంపుతోంది...' : 'OTP పంపి కొనసాగండి'}
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
