
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// =================================================================================
// 🔥 CRITICAL FIREBASE CONFIGURATION FOR PHONE AUTH 🔥
// =================================================================================
// The `auth/captcha-check-failed` or `auth/internal-error` means Firebase is
// blocking your request because it's coming from an unrecognized domain.
//
// TO FIX THIS:
// 1. Open your browser's developer console (Right-click -> Inspect -> Console).
// 2. Find the domain name logged below (e.g., "localhost" or a long cloud URL).
// 3. Go to your Firebase Console: https://console.firebase.google.com/
// 4. Select your project.
// 5. Go to "Authentication" -> "Settings" -> "Authorized domains".
// 6. Click "Add domain" and paste the domain from your console.
// =================================================================================


declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const FAKE_EMAIL_DOMAIN = "@sanghika.samakhya";

export default function SignupForm() {
  const router = useRouter();
  const { toast: shadToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
 
  const [formData, setFormData] = useState({
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
    if (typeof window !== 'undefined') {
      console.log('================================================================================');
      console.log('🔥 FIREBASE AUTH DOMAIN:', window.location.hostname);
      console.log('Add the domain above to your Firebase Console -> Authentication -> Settings -> Authorized domains');
      console.log('================================================================================');
    }
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        toast.error('Please enter a valid 10-digit Indian phone number.');
        setLoading(false);
        return;
    }
    
    try {
      const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0) {
        toast.error('An account with this phone number already exists. Please log in.');
        router.push('/login');
        setLoading(false);
        return;
      }
      
      // Create a new verifier each time to avoid issues with expired tokens
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
      });
      
      const fullPhoneNumber = `+91${formData.phone}`;
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = 'Failed to send OTP. Please try again later.';
       if (error.code === 'auth/captcha-check-failed' || error.code === 'auth/internal-error') {
          errorMessage = "Action failed. Please ensure your domain (e.g., 'localhost') is authorized in the Firebase console's Authentication settings.";
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
    if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
    }
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error("OTP not verified.");
      }

      await confirmationResult.confirm(formData.otp);
      
      const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
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
      
      // No toast here, redirect will show it
      router.push('/login?registered=true');

    } catch (error: any) {
        console.error("Signup Error:", error);

        if (error.code === 'auth/email-already-in-use') {
            shadToast({
                title: "Account Already Exists",
                description: "This phone number is already registered. Please login instead.",
                variant: "destructive",
            });
            router.push('/login');
        } else {
            let errorMessage = "An unknown error occurred.";
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = "The OTP is incorrect. Please check and try again.";
            } else if (error.code === 'auth/code-expired') {
                errorMessage = "The OTP has expired. Please request a new one.";
            }
            shadToast({
                title: "Signup Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
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
                    <Input id="phone" type="tel" placeholder="9876543210" required onChange={handleInputChange} value={formData.phone} disabled={otpSent}/>
                </div>
            </div>

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
                    <Input id="country" placeholder="India" required onChange={handleInputChange} value={formData.country} disabled={true}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="pin">Pin</Label>
                    <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin} disabled={otpSent}/>
                </div>
            </div>
            
            {otpSent && (
              <>
                <div className="grid gap-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword} />
                    </div>
                </div>
              </>
            )}

            <div id="recaptcha-container"></div>
            
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
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
    </div>
  );
}
