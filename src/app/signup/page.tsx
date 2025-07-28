
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { add } from 'date-fns';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pin: '',
  });

  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Render recaptcha verifier
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


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
        const formattedPhone = `+91${formData.phone}`;
        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier!);
        window.confirmationResult = confirmationResult;
        setStep('otp');
        toast({
          title: "Verification Code Sent",
          description: "Please enter the code sent to your phone.",
        });
    } catch (error: any) {
        console.error("OTP Send Error:", error);
        toast({
            title: "Error Sending Code",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
        const userCredential: UserCredential = await window.confirmationResult.confirm(otp);
        const user = userCredential.user;

        const plan = searchParams.get('plan') || 'yearly';
        const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });
        
        // Split full name into first and last
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: null, // No email in this flow
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pin}`,
            createdAt: new Date(),
            subscription: {
                plan: plan,
                status: 'active',
                renewalDate: renewalDate,
            }
        });
        
        toast({
            title: "Account Created!",
            description: "You have been successfully registered.",
        });

        router.push('/dashboard');

    } catch (error: any) {
        console.error("Signup Error:", error);
        toast({
            title: "Signup Failed",
            description: "The verification code was incorrect or another error occurred.",
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
            {step === 'details' 
              ? "Enter your information to create an account." 
              : "Enter the OTP sent to your phone to complete registration."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form className="grid gap-4" onSubmit={handleSendOtp}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" placeholder="Pietro Schirano" required onChange={handleInputChange} value={formData.fullName} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="987-654-3210" required onChange={handleInputChange} value={formData.phone}/>
                  </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="11-2-333, Landmark" required onChange={handleInputChange} value={formData.address} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Hyderabad" required onChange={handleInputChange} value={formData.city}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="Telangana" required onChange={handleInputChange} value={formData.state}/>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="India" required onChange={handleInputChange} value={formData.country}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="pin">Pin</Label>
                      <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin}/>
                  </div>
              </div>
              
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>
            </form>
          ) : (
             <form className="grid gap-4" onSubmit={handleVerifyOtpAndSignup}>
                <div className="grid gap-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                    {loading ? 'Verifying...' : 'Create Account'}
                </Button>
                <Button variant="link" onClick={() => setStep('details')}>Back to details</Button>
            </form>
          )}

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
