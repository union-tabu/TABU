
// src/components/auth/signup-form.tsx
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
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const FAKE_EMAIL_DOMAIN = "@sanghika.samakhya";

interface FormData {
  fullName: string;
  phone: string;
  otp: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pin: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const recaptchaRendered = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    otp: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pin: '',
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const validateForm = (isSignupStep: boolean = false): boolean => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) errors.phone = 'Please enter a valid 10-digit Indian phone number';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pin) errors.pin = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pin)) errors.pin = 'PIN code must be exactly 6 digits';

    if (isSignupStep) {
      if (!formData.otp) errors.otp = 'OTP is required';
      else if (!/^\d{6}$/.test(formData.otp)) errors.otp = 'OTP must be exactly 6 digits';
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters long';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormErrors(prev => ({ ...prev, [id]: '' }));
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const setupRecaptcha = () => {
    if (recaptchaRendered.current) return;
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible', 'callback': () => {}
      });
      recaptchaRendered.current = true;
    } catch (error) {
      console.error('reCAPTCHA setup error:', error);
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
  
  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        toast({ title: "Account Already Exists", description: "This phone number is already registered. Please login.", variant: "destructive" });
        router.push('/login');
        return;
      }

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) throw new Error("reCAPTCHA not initialized.");

      const fullPhoneNumber = `+91${formData.phone}`;
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      
      setOtpSent(true);
      startResendTimer();
      toast({ title: "OTP Sent", description: `An OTP has been sent to +91${formData.phone}` });

    } catch (error: any) {
      console.error("OTP Send Error:", error);
      toast({ title: "OTP Send Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm(true)) return;

    setLoading(true);
    const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
    try {
      if (!window.confirmationResult) throw new Error("OTP not verified.");
      
      // First, confirm the OTP. This implicitly signs the user in.
      await window.confirmationResult.confirm(formData.otp);
      
      // Immediately sign out this temporary user.
      await signOut(auth);

      // Now, create the account with email and password. This is the account that will persist.
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;

      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        phone: formData.phone,
        address: `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()}, ${formData.country} - ${formData.pin}`,
        createdAt: new Date(),
        subscription: { status: 'not subscribed' },
        email: '' 
      });

      toast({ title: "Account Created Successfully!", description: "Please log in with your new credentials." });
      router.push('/login?registered=true');

    } catch (error: any) {
      console.error("Signup Error:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'auth/invalid-verification-code') errorMessage = "The OTP you entered is incorrect.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "This phone number is already registered.";
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-2xl w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create New Account</CardTitle>
          <CardDescription>
            {otpSent 
              ? "Enter the OTP and create your password" 
              : "Enter your information to create an account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={otpSent ? handleSignup : handleSendOtp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" value={formData.fullName} onChange={handleInputChange} disabled={otpSent} className={formErrors.fullName ? 'border-red-500' : ''} />
                {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} disabled={otpSent} maxLength={10} className={formErrors.phone ? 'border-red-500' : ''} />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" value={formData.address} onChange={handleInputChange} disabled={otpSent} className={formErrors.address ? 'border-red-500' : ''} />
              {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={formData.city} onChange={handleInputChange} disabled={otpSent} className={formErrors.city ? 'border-red-500' : ''} />
                {formErrors.city && <p className="text-xs text-red-500">{formErrors.city}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" value={formData.state} onChange={handleInputChange} disabled={otpSent} className={formErrors.state ? 'border-red-500' : ''} />
                {formErrors.state && <p className="text-xs text-red-500">{formErrors.state}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} disabled={true} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pin">PIN Code *</Label>
                <Input id="pin" value={formData.pin} onChange={handleInputChange} disabled={otpSent} maxLength={6} className={formErrors.pin ? 'border-red-500' : ''} />
                {formErrors.pin && <p className="text-xs text-red-500">{formErrors.pin}</p>}
              </div>
            </div>
            
            {otpSent && (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp">Enter OTP *</Label>
                    {otpResendTimer > 0 ? (
                      <span className="text-sm text-gray-500">Resend in {otpResendTimer}s</span>
                    ) : (
                      <Button type="button" variant="link" size="sm" onClick={handleSendOtp} disabled={loading} className="p-0 h-auto">Resend OTP</Button>
                    )}
                  </div>
                  <Input id="otp" value={formData.otp} onChange={handleInputChange} maxLength={6} className={formErrors.otp ? 'border-red-500' : ''} />
                  {formErrors.otp && <p className="text-xs text-red-500">{formErrors.otp}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" value={formData.password} onChange={handleInputChange} className={formErrors.password ? 'border-red-500' : ''} />
                    {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className={formErrors.confirmPassword ? 'border-red-500' : ''} />
                    {formErrors.confirmPassword && <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>}
                  </div>
                </div>
                 <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>Password Requirements:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                  </ul>
                </div>
              </>
            )}

            <div id="recaptcha-container"></div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (otpSent ? 'Creating Account...' : 'Sending OTP...') : (otpSent ? 'Create Account' : 'Send OTP & Continue')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
