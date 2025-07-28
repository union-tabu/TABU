
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        });
    
        return () => {
          window.recaptchaVerifier?.clear();
        };
      }, []);

      const handleSendOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
    
        try {
          const formattedPhone = `+91${phone}`;
          const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier!);
          window.confirmationResult = confirmationResult;
          setStep('otp');
          toast({
            title: "OTP పంపబడింది",
            description: "మీ ఫోన్ నంబర్‌కు OTP పంపబడింది.",
          });
        } catch (error: any) {
          console.error("OTP Send Error:", error);
          toast({
            title: "OTP పంపడంలో విఫలమైంది",
            description: error.message,
            variant: "destructive",
          });
        } finally {
            setLoading(false);
        }
      };
    
      const handleVerifyOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
    
        try {
          await window.confirmationResult.confirm(otp);
          localStorage.setItem('isAuthenticated', 'true');
          router.push('/te/dashboard');
          toast({
            title: "లాగిన్ విజయవంతమైంది",
            description: "మీరు విజయవంతంగా లాగిన్ అయ్యారు.",
          });
        } catch (error: any) {
            console.error("OTP Verification Error:", error);
            toast({
                title: "లాగిన్ విఫలమైంది",
                description: "మీరు నమోదు చేసిన OTP తప్పు. దయచేసి మళ్లీ ప్రయత్నించండి.",
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
          <CardDescription>లాగిన్ కోడ్ పొందడానికి మీ ఫోన్ నంబర్‌ను నమోదు చేయండి</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
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
                  />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                  {loading ? 'OTP పంపుతోంది...' : 'OTP పంపండి'}
              </Button>
              </form>
          ) : (
              <form className="grid gap-4" onSubmit={handleVerifyOtp}>
              <div className="grid gap-2">
                  <Label htmlFor="otp">OTPని నమోదు చేయండి</Label>
                  <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                  {loading ? 'ధృవీకరిస్తోంది...' : 'లాగిన్'}
              </Button>
              <Button variant="link" onClick={() => setStep('phone')}>వేరే ఫోన్ నంబర్‌ను ఉపయోగించండి</Button>
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
