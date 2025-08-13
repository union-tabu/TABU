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

const FAKE_EMAIL_DOMAIN = "@tabu";

export default function VerifyForm() {
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
    const storedData = sessionStorage.getItem('signupFormData');
    const storedImage = sessionStorage.getItem('signupProfileImage');

    if (!storedData || !storedImage) {
      toast({ title: 'Error', description: 'Signup data not found. Please start the registration process again.', variant: 'destructive' });
      router.push('/en/signup');
    } else {
      setSignupData(JSON.parse(storedData));
      setProfileImage(storedImage);
    }
  }, [router, toast]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!/^\d{6}$/.test(formData.otp)) errors.otp = 'OTP must be 6 digits';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
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
        throw new Error("OTP confirmation session has expired. Please try signing up again.");
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
        role: 'member', // Default role for new users
        createdAt: new Date(),
        subscription: { status: 'pending' },
        email: ''
      });

      // Auto-login after successful registration
      await signInWithEmailAndPassword(auth, email, formData.password);

      sessionStorage.removeItem('signupFormData');
      sessionStorage.removeItem('signupProfileImage');
      toast({ title: 'Account Created!', description: 'Redirecting you to the dashboard...' });
      router.push('/en/dashboard');

    } catch (error: any) {
      console.error("Signup Error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "The OTP you entered is incorrect. Please check and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "The OTP has expired. Please go back to the previous page and request a new one.";
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = "This account is already linked to another user. Please start the signup process again.";
      }
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!signupData) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle>Verify & Create Password</CardTitle>
          <CardDescription>Enter the OTP sent to {signupData.phone} and set your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSignup}>
            <div className="grid gap-2">
              <Label htmlFor="otp">Enter OTP *</Label>
              <Input id="otp" type="text" placeholder="123456" required onChange={handleInputChange} value={formData.otp} maxLength={6} className={formErrors.otp ? 'border-red-500' : ''}/>
              {formErrors.otp && <p className="text-xs text-red-500">{formErrors.otp}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Set Password *</Label>
              <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} className={formErrors.password ? 'border-red-500' : ''}/>
              {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword} className={formErrors.confirmPassword ? 'border-red-500' : ''}/>
              {formErrors.confirmPassword && <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Entered wrong details?{' '}
            <Link href="/en/signup" className="underline hover:text-primary">
              Go Back
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
