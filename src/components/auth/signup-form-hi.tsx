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

export default function SignupFormHi() {
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
    country: 'भारत',
    pinCode: '',
    profession: '',
    referredBy: '',
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
    if (!formData.fullName.trim()) errors.fullName = 'पूरा नाम आवश्यक है';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = 'कृपया एक मान्य 10-अंकीय भारतीय फ़ोन नंबर दर्ज करें';
    if (!formData.addressLine.trim()) errors.addressLine = 'पता आवश्यक है';
    if (!formData.city.trim()) errors.city = 'शहर आवश्यक है';
    if (!formData.state.trim()) errors.state = 'राज्य आवश्यक है';
    if (!/^\d{6}$/.test(formData.pinCode)) errors.pinCode = 'पिन कोड 6 अंकों का होना चाहिए';
    if (!formData.profession.trim()) errors.profession = 'पेशा आवश्यक है';
    if (!/^[6-9]\d{9}$/.test(formData.referredBy)) errors.referredBy = 'कृपया एक मान्य 10-अंकीय रेफ़रल फ़ोन नंबर दर्ज करें';
    if (!formData.profileImage) errors.profileImage = 'प्रोफ़ाइल छवि आवश्यक है';
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
        setFormErrors(prev => ({ ...prev, profileImage: 'छवि का आकार 2MB से कम होना चाहिए' }));
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
          title: 'फ़ोन नंबर पहले से पंजीकृत है',
          description: 'इस फ़ोन नंबर से एक खाता पहले से मौजूद है। कृपया साइन इन करें।',
          variant: 'destructive',
        });
        router.push('/hi/signin');
        return;
      }

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const fullPhoneNumber = `+91${formData.phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      
      const { profileImage, ...serializableFormData } = formData;
      sessionStorage.setItem('signupFormDataHi', JSON.stringify(serializableFormData));
      if (formData.profileImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
           sessionStorage.setItem('signupProfileImageHi', e.target?.result as string);
        }
        reader.readAsDataURL(formData.profileImage);
      }

      window.confirmationResult = confirmationResult;

      toast({ title: 'OTP सफलतापूर्वक भेजा गया!', description: `एक सत्यापन कोड +91${formData.phone} पर भेजा गया है।` });
      router.push('/hi/verify');

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।";
        if (error.code === 'auth/too-many-requests') {
            errorMessage = "बहुत अधिक अनुरोध भेजे गए हैं। कृपया कुछ मिनट प्रतीक्षा करें और पुनः प्रयास करें।";
        } else if (error.code === 'auth/invalid-phone-number') {
            errorMessage = "फ़ोन नंबर प्रारूप अमान्य है।";
        }
      toast({ title: 'OTP भेजने में विफल', description: errorMessage, variant: 'destructive' });
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
          <CardTitle className="text-2xl font-headline">नया खाता बनाएँ</CardTitle>
          <CardDescription>खाता बनाने के लिए अपनी जानकारी दर्ज करें।</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSendOtp}>
            <div className="grid gap-2 items-center justify-center text-center">
                <Label htmlFor="profileImage">प्रोफ़ाइल छवि *</Label>
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
                <p className="text-xs text-muted-foreground">अपलोड करने के लिए क्लिक करें (अधिकतम 2MB)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">पूरा नाम *</Label>
                <Input id="fullName" placeholder="पूरा नाम" required onChange={handleInputChange} value={formData.fullName} className={formErrors.fullName ? 'border-red-500' : ''} />
                {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">फ़ोन *</Label>
                <Input id="phone" type="tel" placeholder="9876543210" required onChange={handleInputChange} value={formData.phone} maxLength={10} className={formErrors.phone ? 'border-red-500' : ''} />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="profession">पेशा *</Label>
                  <Input id="profession" placeholder="उदा. मिस्त्री, इलेक्ट्रीशियन" required onChange={handleInputChange} value={formData.profession} className={formErrors.profession ? 'border-red-500' : ''}/>
                  {formErrors.profession && <p className="text-xs text-red-500">{formErrors.profession}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referredBy">द्वारा संदर्भित *</Label>
                  <Input id="referredBy" type="tel" placeholder="संदर्भकर्ता का फ़ोन नंबर" required onChange={handleInputChange} value={formData.referredBy} maxLength={10} className={formErrors.referredBy ? 'border-red-500' : ''}/>
                  {formErrors.referredBy && <p className="text-xs text-red-500">{formErrors.referredBy}</p>}
                </div>
             </div>
            <div className="grid gap-2">
              <Label htmlFor="addressLine">पता *</Label>
              <Input id="addressLine" placeholder="11-2-333, लैंडमार्क" required onChange={handleInputChange} value={formData.addressLine} className={formErrors.addressLine ? 'border-red-500' : ''} />
              {formErrors.addressLine && <p className="text-xs text-red-500">{formErrors.addressLine}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">शहर *</Label>
                <Input id="city" placeholder="हैदराबाद" required onChange={handleInputChange} value={formData.city} className={formErrors.city ? 'border-red-500' : ''} />
                {formErrors.city && <p className="text-xs text-red-500">{formErrors.city}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">राज्य *</Label>
                <Input id="state" placeholder="तेलंगाना" required onChange={handleInputChange} value={formData.state} className={formErrors.state ? 'border-red-500' : ''} />
                {formErrors.state && <p className="text-xs text-red-500">{formErrors.state}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">देश</Label>
                <Input id="country" value={formData.country} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pinCode">पिन *</Label>
                <Input id="pinCode" placeholder="500089" required onChange={handleInputChange} value={formData.pinCode} maxLength={6} className={formErrors.pinCode ? 'border-red-500' : ''} />
                {formErrors.pinCode && <p className="text-xs text-red-500">{formErrors.pinCode}</p>}
              </div>
            </div>
            <div id="recaptcha-container"></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'OTP भेजा जा रहा है...' : 'जारी रखें'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            पहले से ही खाता है?{' '}
            <Link href="/hi/signin" className="underline hover:text-primary">
              साइन इन करें
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
