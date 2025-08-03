
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db, storage } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import Image from 'next/image';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    country: 'భారతదేశం',
    pinCode: '',
    profileImage: null as File | null,
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
    if (!formData.addressLine.trim()) errors.addressLine = 'చిరునామా అవసరం';
    if (!formData.city.trim()) errors.city = 'నగరం అవసరం';
    if (!formData.state.trim()) errors.state = 'రాష్ట్రం అవసరం';
    if (!/^\d{6}$/.test(formData.pinCode)) errors.pinCode = 'పిన్ కోడ్ 6 అంకెలు ఉండాలి';
    if (!formData.profileImage) errors.profileImage = 'ప్రొఫైల్ చిత్రం అవసరం';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (formErrors[id]) setFormErrors(prev => ({ ...prev, [id]: '' }));
    setFormData(prev => ({ ...prev, [id]: value as any }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setFormErrors(prev => ({ ...prev, profileImage: 'చిత్రం పరిమాణం 2MB కంటే తక్కువగా ఉండాలి' }));
        return;
      }
      setFormErrors(prev => ({ ...prev, profileImage: '' }));
      setFormData(prev => ({...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          description: 'ఈ ఫోన్ నంబర్‌తో ఖాతా ఇప్పటికే ఉంది. దయచేసి సైన్ ఇన్ చేయండి.',
          variant: 'destructive',
        });
        router.push('/te/login');
        return;
      }

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const fullPhoneNumber = `+91${formData.phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      
      const { profileImage, ...serializableFormData } = formData;
      sessionStorage.setItem('signupFormDataTe', JSON.stringify(serializableFormData));
      if (formData.profileImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
           sessionStorage.setItem('signupProfileImageTe', e.target?.result as string);
        }
        reader.readAsDataURL(formData.profileImage);
      }

      window.confirmationResult = confirmationResult;

      toast({ title: 'OTP విజయవంతంగా పంపబడింది!', description: `ధృవీకరణ కోడ్ +91${formData.phone}కు పంపబడింది.` });
      router.push('/te/verify');

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = "ఊహించని లోపం సంభవించింది. దయచేసి మళ్ళీ ప్రయత్నించండి.";
        if (error.code === 'auth/too-many-requests') {
            errorMessage = "చాలా అభ్యర్థనలు పంపబడ్డాయి. దయచేసి కొన్ని నిమిషాలు ఆగి మళ్ళీ ప్రయత్నించండి.";
        } else if (error.code === 'auth/invalid-phone-number') {
            errorMessage = "ఫోన్ నంబర్ ఫార్మాట్ చెల్లదు.";
        }
      toast({ title: 'OTP పంపడంలో విఫలమైంది', description: errorMessage, variant: 'destructive' });
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
            <div className="grid gap-2 items-center justify-center text-center">
                <Label htmlFor="profileImage">ప్రొఫైల్ చిత్రం *</Label>
                <div 
                    className="relative mx-auto w-28 h-28 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Profile preview" layout="fill" className="rounded-full object-cover"/>
                    ) : (
                        <Camera className="w-8 h-8 text-gray-400"/>
                    )}
                </div>
                <Input id="profileImage" type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} className="hidden" onChange={handleImageChange} required/>
                {formErrors.profileImage && <p className="text-xs text-red-500 mt-1">{formErrors.profileImage}</p>}
                <p className="text-xs text-muted-foreground">అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి (గరిష్టంగా 2MB)</p>
            </div>
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
              <Label htmlFor="addressLine">చిరునామా *</Label>
              <Input id="addressLine" placeholder="11-2-333, ల్యాండ్‌మార్క్" required onChange={handleInputChange} value={formData.addressLine} className={formErrors.addressLine ? 'border-red-500' : ''} />
              {formErrors.addressLine && <p className="text-xs text-red-500">{formErrors.addressLine}</p>}
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
                <Label htmlFor="pinCode">పిన్ *</Label>
                <Input id="pinCode" placeholder="500089" required onChange={handleInputChange} value={formData.pinCode} maxLength={6} className={formErrors.pinCode ? 'border-red-500' : ''} />
                {formErrors.pinCode && <p className="text-xs text-red-500">{formErrors.pinCode}</p>}
              </div>
            </div>
            <div id="recaptcha-container"></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'OTP పంపుతోంది...' : 'కొనసాగండి'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ఇప్పటికే ఖాతా ఉందా?{' '}
            <Link href="/te/login" className="underline hover:text-primary">
              సైన్ ఇన్
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
