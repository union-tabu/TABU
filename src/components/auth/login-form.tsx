
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginForm() {
  const router = useRouter();
  const { toast: shadToast } = useToast();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Cleanup reCAPTCHA on component unmount
    return () => {
      window.recaptchaVerifier?.clear();
    };
  }, []);

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
    const fullPhoneNumber = `+91${phone}`;

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

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!otp) return;
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult;
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/dashboard');
        shadToast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
        });
      }
    } catch (error: any) {
        console.error("Login Error:", error);
        let errorMessage = "An unknown error occurred. Please try again.";
        if (error.code === 'auth/invalid-verification-code') {
            errorMessage = "Invalid OTP. Please check the code and try again.";
        } else if (error.code === 'auth/code-expired') {
            errorMessage = "The OTP has expired. Please request a new one.";
        }
        shadToast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>Enter your phone number to receive a login OTP</CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form className="grid gap-4" onSubmit={handleSendOtp}>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={handleLogin}>
              <div className="grid gap-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button variant="link" size="sm" onClick={() => setOtpSent(false)}>Use a different phone number</Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      <div id="recaptcha-container"></div>
    </div>
  );
}
