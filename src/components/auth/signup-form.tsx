// src/components/auth/signup-form.tsx
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

interface FormData {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  profession: string;
  referredBy: string;
  profileImage: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
    profession: '',
    referredBy: '',
    profileImage: null,
  });

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = 'Please enter a valid 10-digit Indian phone number';
    if (!formData.addressLine.trim()) errors.addressLine = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!/^\d{6}$/.test(formData.pinCode)) errors.pinCode = 'PIN code must be 6 digits';
    if (!formData.profession.trim()) errors.profession = 'Profession is required';
    if (!/^[6-9]\d{9}$/.test(formData.referredBy)) errors.referredBy = 'Please enter a valid 10-digit referrer phone number';
    if (!formData.profileImage) errors.profileImage = 'Profile image is required';
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
        setFormErrors(prev => ({ ...prev, profileImage: 'Image size must be less than 2MB' }));
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
          title: "Phone Number Already Registered",
          description: "An account with this phone number already exists. Please proceed to sign in.",
          variant: "destructive",
        });
        router.push('/signin');
        return;
      }

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
      const fullPhoneNumber = `+91${formData.phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      
      const { profileImage, ...serializableFormData } = formData;
      sessionStorage.setItem('signupFormData', JSON.stringify(serializableFormData));
      // Store image in a way that survives sessionStorage (e.g., base64 in session, or IndexedDB)
      if (formData.profileImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
           sessionStorage.setItem('signupProfileImage', e.target?.result as string);
        }
        reader.readAsDataURL(formData.profileImage);
      }


      window.confirmationResult = confirmationResult;

      toast({ title: "OTP Sent Successfully!", description: `A verification code has been sent to +91${formData.phone}.` });
      router.push('/verify');

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/too-many-requests') {
          errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      } else if (error.code === 'auth/invalid-phone-number') {
          errorMessage = "The phone number format is invalid.";
      }
      toast({ title: "Failed to Send OTP", description: errorMessage, variant: "destructive" });
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
          <CardTitle className="text-2xl">Create New Account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSendOtp}>
            <div className="grid gap-2 items-center justify-center text-center">
                <Label htmlFor="profileImage">Profile Image *</Label>
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
                <p className="text-xs text-muted-foreground">Click to upload (Max 2MB)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" placeholder="John Doe" required onChange={handleInputChange} value={formData.fullName} className={formErrors.fullName ? 'border-red-500' : ''}/>
                {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="9876543210" required onChange={handleInputChange} value={formData.phone} maxLength={10} className={formErrors.phone ? 'border-red-500' : ''}/>
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="profession">Profession *</Label>
                  <Input id="profession" placeholder="e.g. Mason, Electrician" required onChange={handleInputChange} value={formData.profession} className={formErrors.profession ? 'border-red-500' : ''}/>
                  {formErrors.profession && <p className="text-xs text-red-500">{formErrors.profession}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referredBy">Referred by *</Label>
                  <Input id="referredBy" type="tel" placeholder="Referrer's phone number" required onChange={handleInputChange} value={formData.referredBy} maxLength={10} className={formErrors.referredBy ? 'border-red-500' : ''}/>
                  {formErrors.referredBy && <p className="text-xs text-red-500">{formErrors.referredBy}</p>}
                </div>
             </div>
            <div className="grid gap-2">
              <Label htmlFor="addressLine">Address *</Label>
              <Input id="addressLine" placeholder="11-2-333, Landmark, Street Name" required onChange={handleInputChange} value={formData.addressLine} className={formErrors.addressLine ? 'border-red-500' : ''}/>
              {formErrors.addressLine && <p className="text-xs text-red-500">{formErrors.addressLine}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" placeholder="Hyderabad" required onChange={handleInputChange} value={formData.city} className={formErrors.city ? 'border-red-500' : ''}/>
                {formErrors.city && <p className="text-xs text-red-500">{formErrors.city}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" placeholder="Telangana" required onChange={handleInputChange} value={formData.state} className={formErrors.state ? 'border-red-500' : ''}/>
                {formErrors.state && <p className="text-xs text-red-500">{formErrors.state}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} disabled/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pinCode">PIN Code *</Label>
                <Input id="pinCode" placeholder="500089" required onChange={handleInputChange} value={formData.pinCode} maxLength={6} className={formErrors.pinCode ? 'border-red-500' : ''}/>
                {formErrors.pinCode && <p className="text-xs text-red-500">{formErrors.pinCode}</p>}
              </div>
            </div>
            <div id="recaptcha-container"></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/signin" className="underline hover:text-primary">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
