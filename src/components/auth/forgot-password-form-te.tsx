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

const FAKE_EMAIL_DOMAIN = "@tabu";

export default function ForgotPasswordFormTe() {
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
    if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = 'దయచేసి చెల్లుబాటు అయ్యే 10-అంకెల భారతీయ ఫోన్ నంబర్‌ను నమోదు చేయండి';
    if (otpSent) {
        if (!/^\d{6}$/.test(formData.otp)) errors.otp = 'OTP తప్పనిసరిగా 6 అంకెలు ఉండాలి';
        if (formData.newPassword.length < 8) errors.newPassword = 'పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి';
        if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు';
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
      console.error('reCAPTCHA సెటప్ లోపం:', error);
      throw new Error('భద్రతా ధృవీకరణను ప్రారంభించడంలో విఫలమైంది');
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
        toast({ title: "ఫోన్ నంబర్ కనుగొనబడలేదు", description: "ఈ ఫోన్ నంబర్‌తో ఏ ఖాతా అనుబంధించబడలేదు. దయచేసి నంబర్‌ను తనిఖీ చేయండి లేదా సైన్ అప్ చేయండి.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      setupRecaptcha();
      const fullPhoneNumber = `+91${formData.phone}`;
      
      if (!window.recaptchaVerifier) {
        throw new Error('భద్రతా ధృవీకరణ ప్రారంభించబడలేదు.');
      }
      
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
      
      setOtpSent(true);
      startResendTimer();
      toast({ title: "OTP పంపబడింది", description: `ధృవీకరణ కోడ్ +91${formData.phone}కు పంపబడింది.` });

    } catch (error: any) {
      console.error("OTP పంపడంలో లోపం:", error);
      toast({ title: "OTP పంపడంలో విఫలమైంది", description: "OTP పంపడంలో ఒక లోపం ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.", variant: "destructive" });
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
        if (!window.recaptchaVerifier) throw new Error('భద్రతా ధృవీకరణ ప్రారంభించబడలేదు.');
        window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
        startResendTimer();
        toast({ title: "OTP మళ్ళీ పంపబడింది", description: `కొత్త ధృవీకరణ కోడ్ +91${formData.phone}కు పంపబడింది.` });
    } catch (error) {
        toast({ title: "OTP మళ్ళీ పంపడంలో విఫలమైంది", description: "దయచేసి మళ్లీ ప్రయత్నించండి.", variant: "destructive" });
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
      if (!window.confirmationResult) throw new Error("OTP ధృవీకరణ సెషన్ గడువు ముగిసింది. దయచేసి కొత్త OTPని అభ్యర్థించండి.");

      const userCredential = await window.confirmationResult.confirm(formData.otp);
      const user = userCredential.user;
      
      await updatePassword(user, formData.newPassword);
      
      toast({ title: "పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది!", description: "మీరు ఇప్పుడు మీ కొత్త పాస్‌వర్డ్‌తో సైన్ ఇన్ చేయవచ్చు." });
      await auth.signOut();
      router.push('/te/signin?reset=success');

    } catch (error: any) {
      console.error("పాస్‌వర్డ్ రీసెట్ లోపం:", error);
      let errorMessage = "పాస్‌వర్డ్‌ను రీసెట్ చేయడంలో ఒక లోపం ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.";
      if (error.code === 'auth/invalid-verification-code') {
          errorMessage = "మీరు నమోదు చేసిన OTP తప్పు. దయచేసి తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
      } else if (error.code === 'auth/code-expired') {
          errorMessage = "OTP గడువు ముగిసింది. దయచేసి కొత్తదాన్ని అభ్యర్థించండి.";
      }
      toast({ title: "పాస్‌వర్డ్ రీసెట్ విఫలమైంది", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">పాస్వర్డ్ రీసెట్ చేయండి</CardTitle>
          <CardDescription>
            {otpSent ? "మీ ఫోన్‌కు పంపిన OTPని నమోదు చేసి, కొత్త పాస్‌వర్డ్‌ను సెట్ చేయండి" : "పాస్‌వర్డ్ రీసెట్ కోడ్‌ను స్వీకరించడానికి మీ నమోదిత ఫోన్ నంబర్‌ను నమోదు చేయండి"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
            <div className="grid gap-2">
              <Label htmlFor="phone">ఫోన్ నంబర్ *</Label>
              <Input id="phone" type="tel" placeholder="9876543210" required onChange={handleInputChange} value={formData.phone} disabled={otpSent} maxLength={10} className={formErrors.phone ? 'border-red-500' : ''}/>
              {formErrors.phone && <span className="text-sm text-red-500">{formErrors.phone}</span>}
            </div>
            
            {otpSent && (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp">OTPని నమోదు చేయండి *</Label>
                    {otpResendTimer > 0 ? (<span className="text-sm text-gray-500">{otpResendTimer}సెకన్లలో మళ్లీ పంపండి</span>) : 
                    (<Button type="button" variant="ghost" size="sm" onClick={handleResendOtp} disabled={loading}>OTPని మళ్లీ పంపండి</Button>)}
                  </div>
                  <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} className={formErrors.otp ? 'border-red-500' : ''}/>
                  {formErrors.otp && <span className="text-sm text-red-500">{formErrors.otp}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">కొత్త పాస్‌వర్డ్ *</Label>
                  <Input id="newPassword" type="password" required onChange={handleInputChange} value={formData.newPassword} className={formErrors.newPassword ? 'border-red-500' : ''}/>
                  {formErrors.newPassword && <span className="text-sm text-red-500">{formErrors.newPassword}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి *</Label>
                  <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword} className={formErrors.confirmPassword ? 'border-red-500' : ''}/>
                  {formErrors.confirmPassword && <span className="text-sm text-red-500">{formErrors.confirmPassword}</span>}
                </div>
              </>
            )}

            <div id="recaptcha-container"></div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (otpSent ? 'పాస్‌వర్డ్‌ను రీసెట్ చేస్తోంది...' : 'OTP పంపుతోంది...') : (otpSent ? 'పాస్వర్డ్ రీసెట్ చేయండి' : 'OTP పంపండి')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            మీ పాస్‌వర్డ్ గుర్తుందా?{' '}
            <Link href="/te/signin" className="underline">
              సైన్ ఇన్ కు తిరిగి వెళ్లండి
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
