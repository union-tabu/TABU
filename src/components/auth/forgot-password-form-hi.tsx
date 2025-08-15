"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  updatePassword,
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function ForgotPasswordFormHi() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = 'कृपया एक मान्य 10-अंकीय भारतीय फ़ोन नंबर दर्ज करें';
    if (otpSent) {
        if (!/^\d{6}$/.test(formData.otp)) errors.otp = 'OTP 6 अंकों का होना चाहिए';
        if (formData.newPassword.length < 8) errors.newPassword = 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए';
        if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'पासवर्ड मेल नहीं खाते';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (formErrors[id]) setFormErrors(prev => ({ ...prev, [id]: '' }));
  };
  
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
       window.recaptchaVerifier.clear();
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
    } catch (error) {
      console.error('reCAPTCHA सेटअप त्रुटि:', error);
      throw new Error('सुरक्षा सत्यापन प्रारंभ करने में विफल');
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", formData.phone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({ title: "फ़ोन नंबर नहीं मिला", description: "इस फ़ोन नंबर से कोई खाता संबद्ध नहीं है। कृपया नंबर जांचें या साइन अप करें।", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      setupRecaptcha();
      const fullPhoneNumber = `+91${formData.phone}`;
      
      if (!window.recaptchaVerifier) {
        throw new Error('सुरक्षा सत्यापन प्रारंभ नहीं हुआ है।');
      }
      
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
      
      setOtpSent(true);
      startResendTimer();
      toast({ title: "OTP भेजा गया", description: `सत्यापन कोड +91${formData.phone} पर भेजा गया है।` });

    } catch (error: any) {
      console.error("OTP भेजने में त्रुटि:", error);
      toast({ title: "OTP भेजने में विफल", description: "OTP भेजने में एक त्रुटि हुई। कृपया पुनः प्रयास करें।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    setLoading(true);
    try {
        setupRecaptcha();
        const fullPhoneNumber = `+91${formData.phone}`;
        if (!window.recaptchaVerifier) throw new Error('सुरक्षा सत्यापन प्रारंभ नहीं हुआ है।');
        window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
        startResendTimer();
        toast({ title: "OTP पुनः भेजा गया", description: `नया सत्यापन कोड +91${formData.phone} पर भेजा गया है।` });
    } catch (error) {
        toast({ title: "OTP पुनः भेजने में विफल", description: "कृपया पुनः प्रयास करें।", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  
  const startResendTimer = () => {
    setOtpResendTimer(60);
    timerRef.current = setInterval(() => {
      setOtpResendTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (!window.confirmationResult) throw new Error("OTP सत्यापन सत्र समाप्त हो गया है। कृपया एक नया OTP अनुरोध करें।");

      const userCredential = await window.confirmationResult.confirm(formData.otp);
      const user = userCredential.user;
      
      await updatePassword(user, formData.newPassword);
      
      toast({ title: "पासवर्ड सफलतापूर्वक रीसेट किया गया!", description: "अब आप अपने नए पासवर्ड से साइन इन कर सकते हैं।" });
      await auth.signOut();
      router.push('/hi/signin?reset=success');

    } catch (error: any) {
      console.error("पासवर्ड रीसेट त्रुटि:", error);
      let errorMessage = "पासवर्ड रीसेट करने में एक त्रुटि हुई। कृपया पुनः प्रयास करें।";
      if (error.code === 'auth/invalid-verification-code') {
          errorMessage = "आपके द्वारा दर्ज किया गया OTP गलत है। कृपया जांचें और पुनः प्रयास करें।";
      } else if (error.code === 'auth/code-expired') {
          errorMessage = "OTP समाप्त हो गया है। कृपया एक नया अनुरोध करें।";
      }
      toast({ title: "पासवर्ड रीसेट विफल", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">पासवर्ड रीसेट करें</CardTitle>
          <CardDescription>
            {otpSent ? "अपने फ़ोन पर भेजे गए OTP को दर्ज करें और नया पासवर्ड सेट करें" : "पासवर्ड रीसेट कोड प्राप्त करने के लिए अपना पंजीकृत फ़ोन नंबर दर्ज करें"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
            <div className="grid gap-2">
              <Label htmlFor="phone">फ़ोन नंबर *</Label>
              <Input id="phone" type="tel" placeholder="9876543210" required onChange={handleInputChange} value={formData.phone} disabled={otpSent} maxLength={10} className={formErrors.phone ? 'border-red-500' : ''}/>
              {formErrors.phone && <span className="text-sm text-red-500">{formErrors.phone}</span>}
            </div>
            
            {otpSent && (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp">OTP दर्ज करें *</Label>
                    {otpResendTimer > 0 ? (<span className="text-sm text-gray-500">{otpResendTimer} सेकंड में पुनः भेजें</span>) : 
                    (<Button type="button" variant="ghost" size="sm" onClick={handleResendOtp} disabled={loading}>OTP पुनः भेजें</Button>)}
                  </div>
                  <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} className={formErrors.otp ? 'border-red-500' : ''}/>
                  {formErrors.otp && <span className="text-sm text-red-500">{formErrors.otp}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">नया पासवर्ड *</Label>
                  <Input id="newPassword" type="password" required onChange={handleInputChange} value={formData.newPassword} className={formErrors.newPassword ? 'border-red-500' : ''}/>
                  {formErrors.newPassword && <span className="text-sm text-red-500">{formErrors.newPassword}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">नए पासवर्ड की पुष्टि करें *</Label>
                  <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword} className={formErrors.confirmPassword ? 'border-red-500' : ''}/>
                  {formErrors.confirmPassword && <span className="text-sm text-red-500">{formErrors.confirmPassword}</span>}
                </div>
              </>
            )}

            <div id="recaptcha-container"></div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (otpSent ? 'पासवर्ड रीसेट हो रहा है...' : 'OTP भेज रहा है...') : (otpSent ? 'पासवर्ड रीसेट करें' : 'OTP भेजें')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            अपना पासवर्ड याद है?{' '}
            <Link href="/hi/signin" className="underline">
              साइन इन पर वापस जाएं
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
