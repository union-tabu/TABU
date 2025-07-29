
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function SignupForm() {
  const router = useRouter();
  const { toast: shadToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
 
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    otp: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pin: '',
  });

  useEffect(() => {
    return () => {
      window.recaptchaVerifier?.clear();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };

  const generateRecaptcha = () => {
     if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    generateRecaptcha();
    
    const appVerifier = window.recaptchaVerifier!;
    const fullPhoneNumber = `+91${formData.phone}`;

    try {
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = 'Failed to send OTP. Please try again later.';
      if (error.code === 'auth/billing-not-enabled') {
          errorMessage = 'Phone sign-in quota exceeded. Please contact support.';
      } else if (error.code === 'auth/invalid-phone-number') {
          errorMessage = 'The phone number you entered is not valid.';
      } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later.';
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error("OTP not verified.");
      }

      const userCredential = await confirmationResult.confirm(formData.otp);
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
          email: ''
      });
      
      shadToast({
          title: "Account Created!",
          description: "Welcome! Your account is ready. Please subscribe to activate your membership.",
      });

      localStorage.setItem('isAuthenticated', 'true');
      router.push('/subscribe');

    } catch (error: any) {
        console.error("Signup Error:", error);
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/invalid-verification-code') {
            errorMessage = "The OTP is incorrect. Please check and try again.";
        } else if (error.code === 'auth/credential-already-in-use') {
             errorMessage = "This phone number is already registered. Please login instead.";
        } else if (error.code === 'auth/code-expired') {
            errorMessage = "The OTP has expired. Please request a new one.";
        }
        shadToast({
            title: "Signup Failed",
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
          <CardTitle className="text-2xl font-headline">Create New Account</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={otpSent ? handleSignup : handleSendOtp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Pietro Schirano" required onChange={handleInputChange} value={formData.fullName} disabled={otpSent}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="987-654-3210" required onChange={handleInputChange} value={formData.phone} disabled={otpSent}/>
                </div>
            </div>
            
            {otpSent && (
              <div className="grid gap-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="11-2-333, Landmark" required onChange={handleInputChange} value={formData.address} disabled={otpSent}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Hyderabad" required onChange={handleInputChange} value={formData.city} disabled={otpSent}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="Telangana" required onChange={handleInputChange} value={formData.state} disabled={otpSent}/>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="India" required onChange={handleInputChange} value={formData.country} disabled={otpSent}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pin">Pin</Label>
                    <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin} disabled={otpSent}/>
                </div>
            </div>
            
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {otpSent
                ? (loading ? 'Creating Account...' : 'Create Account')
                : (loading ? 'Sending OTP...' : 'Send OTP')
              }
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <div id="recaptcha-container"></div>
    </div>
  );
}
