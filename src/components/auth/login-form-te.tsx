
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

export default function LoginFormTe() {
    const router = useRouter();
    const { toast: shadToast } = useToast();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        return () => {
            window.recaptchaVerifier?.clear();
        };
    }, []);

    const generateRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {}
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
            setLoading(false);
            toast.success('OTP విజయవంతంగా పంపబడింది!');
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            if (error.code === 'auth/billing-not-enabled') {
                 toast.error('ఫోన్ సైన్-ఇన్ కోటా మించిపోయింది. దయచేసి మీ Firebase ప్రాజెక్ట్‌లో బిల్లింగ్‌ను ప్రారంభించండి.');
            } else {
                toast.error('OTP పంపడంలో విఫలమైంది. దయచేసి ఫోన్ నంబర్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.');
            }
            setLoading(false);
            window.recaptchaVerifier?.clear();
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
                router.push('/te/dashboard');
                shadToast({
                    title: "లాగిన్ విజయవంతమైంది",
                    description: "మీరు విజయవంతంగా లాగిన్ అయ్యారు.",
                });
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            let errorMessage = "తెలియని లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి.";
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = "తప్పు OTP. దయచేసి కోడ్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
            }
            shadToast({
                title: "లాగిన్ విఫలమైంది",
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
          <CardTitle className="text-2xl font-headline">లాగిన్</CardTitle>
          <CardDescription>లాగిన్ OTPని పొందడానికి మీ ఫోన్ నంబర్‌ను నమోదు చేయండి</CardDescription>
        </CardHeader>
        <CardContent>
            {!otpSent ? (
                <form className="grid gap-4" onSubmit={handleSendOtp}>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">ఫోన్ నంబర్</Label>
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
                        {loading ? 'OTP పంపుతోంది...' : 'OTP పంపండి'}
                    </Button>
                </form>
            ) : (
                 <form className="grid gap-4" onSubmit={handleLogin}>
                    <div className="grid gap-2">
                        <Label htmlFor="otp">OTPని నమోదు చేయండి</Label>
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
                        {loading ? 'లాగిన్ అవుతోంది...' : 'లాగిన్'}
                    </Button>
                     <Button variant="link" size="sm" onClick={() => setOtpSent(false)}>వేరే ఫోన్ నంబర్‌ను ఉపయోగించండి</Button>
                </form>
            )}
          <div className="mt-4 text-center text-sm">
            ఖాతా లేదా?{' '}
            <Link href="/te/signup" className="underline hover:text-primary">
              నమోదు చేసుకోండి
            </Link>
          </div>
        </CardContent>
      </Card>
      <div id="recaptcha-container"></div>
    </div>
  );
}
