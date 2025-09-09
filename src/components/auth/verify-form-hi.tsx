"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db, storage } from '@/lib/firebase';
import { ConfirmationResult, linkWithCredential, EmailAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { generateUniqueUnionId } from '@/ai/flows/union-id-flow';

const FAKE_EMAIL_DOMAIN = "@tabu.local";

export default function VerifyFormHi() {
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
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('signupFormDataHi');
    const storedImage = sessionStorage.getItem('signupProfileImageHi');
    if (!storedData || !storedImage) {
      toast({ title: 'पंजीकरण त्रुटि', description: 'पंजीकरण डेटा नहीं मिला। कृपया पुनः प्रारंभ करें।', variant: 'destructive' });
      router.push('/hi/signup');
    } else {
      setSignupData(JSON.parse(storedData));
      setProfileImage(storedImage);
    }
  }, [router, toast]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!/^\d{6}$/.test(formData.otp)) errors.otp = 'OTP 6 अंकों का होना चाहिए';
    if (formData.password.length < 8) errors.password = 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'पासवर्ड मेल नहीं खाते';
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
    if (!validateForm() || !signupData || !profileImage) return;
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult as ConfirmationResult | undefined;
      if (!confirmationResult) {
        throw new Error("OTP पुष्टि सत्र समाप्त हो गया है। कृपया पुनः पंजीकरण करने का प्रयास करें।");
      }

      const userCredential = await confirmationResult.confirm(formData.otp);
      const user = userCredential.user;

      // Upload profile image
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      const uploadTask = await uploadString(storageRef, profileImage, 'data_url');
      const photoURL = await getDownloadURL(uploadTask.ref);

      // Generate a unique ID for the user
      const unionId = await generateUniqueUnionId();

      const email = `${signupData.phone}${FAKE_EMAIL_DOMAIN}`;
      const credential = EmailAuthProvider.credential(email, formData.password);
      await linkWithCredential(user, credential);
      
      await setDoc(doc(db, "users", user.uid), {
        unionId: `T.A.B.U-${unionId}`,
        fullName: signupData.fullName,
        phone: signupData.phone,
        addressLine: signupData.addressLine,
        city: signupData.city,
        state: signupData.state,
        pinCode: signupData.pinCode,
        profession: signupData.profession,
        referredBy: signupData.referredBy || '',
        photoURL,
        role: 'member', // Default role
        createdAt: new Date(),
        subscription: { status: 'pending' },
        email: ''
      });
      
      // Auto-login after successful registration
      await signInWithEmailAndPassword(auth, email, formData.password);

      sessionStorage.removeItem('signupFormDataHi');
      sessionStorage.removeItem('signupProfileImageHi');
      toast({ title: 'खाता बन गया!', description: 'डैशबोर्ड पर रीडायरेक्ट किया जा रहा है...' });
      router.push('/hi/dashboard');

    } catch (error: any) {
      console.error("Signup Error:", error);
      let errorMessage = "एक अप्रत्याशित त्रुटि हुई।";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "आपके द्वारा दर्ज किया गया OTP गलत है। कृपया जांचें और पुनः प्रयास करें।";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "OTP समाप्त हो गया है। कृपया वापस जाकर पुनः प्रयास करें।";
      } else if (error.code === 'auth/credential-already-in-use' || error.code === 'auth/email-already-in-use') {
        errorMessage = "यह खाता पहले से ही किसी अन्य उपयोगकर्ता से जुड़ा हुआ है। कृपया साइनअप प्रक्रिया पुनः प्रारंभ करें।";
      } else if (error.code === 'auth/invalid-email') {
          errorMessage = "उपयोग किए गए फ़ोन नंबर के परिणामस्वरूप एक अमान्य आंतरिक ईमेल प्रारूप हुआ। कृपया पुनः साइन अप करने का प्रयास करें।";
      }
      toast({ title: "पंजीकरण विफल", description: errorMessage, variant: "destructive" });
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
          <CardTitle className="font-headline">सत्यापित करें और पासवर्ड बनाएं</CardTitle>
          <CardDescription>{signupData.phone} पर भेजे गए OTP को दर्ज करें और अपना पासवर्ड सेट करें।</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSignup}>
            <div className="grid gap-2">
              <Label htmlFor="otp">OTP दर्ज करें *</Label>
              <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} className={formErrors.otp ? 'border-red-500' : ''}/>
              {formErrors.otp && <p className="text-xs text-red-500">{formErrors.otp}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">पासवर्ड सेट करें *</Label>
              <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} className={formErrors.password ? 'border-red-500' : ''}/>
              {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">पासवर्ड की पुष्टि करें *</Label>
              <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword} className={formErrors.confirmPassword ? 'border-red-500' : ''}/>
              {formErrors.confirmPassword && <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'खाता बनाया जा रहा है...' : 'खाता बनाएं'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            गलत विवरण दर्ज किया?{' '}
            <Link href="/hi/signup" className="underline hover:text-primary">
              वापस जाएं
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
