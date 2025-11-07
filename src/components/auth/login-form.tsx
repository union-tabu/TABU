
// src/components/auth/signin-form.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';

const FAKE_EMAIL_DOMAIN = "@tabu.local";

interface FormErrors {
  phone?: string;
  password?: string;
}

export default function SigninForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Check for password reset success message
  useEffect(() => {
    if (resetSuccess) {
      toast({
        title: "Password Reset Successful!",
        description: "You can now sign in with your new password.",
      });
      // Use router.replace to remove the query param from the URL
      router.replace('/en/signin', { scroll: false });
    }
  }, [resetSuccess, router, toast]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Phone validation
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number starting with 6-9';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: 'phone' | 'password', value: string) => {
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    if (field === 'phone') {
      setPhone(value);
    } else {
      setPassword(value);
    }
  };


  const handleSignin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Form Validation Failed",
        description: "Please correct the errors and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const email = `${phone}${FAKE_EMAIL_DOMAIN}`;
      
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Sign In Successful!",
        description: "Welcome back. Redirecting you to the dashboard...",
      });
      
      router.push('/en/dashboard');
      
    } catch (error: any) {
      console.error("Signin Error:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Sign In Failed";
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-email') {
        errorMessage = "Incorrect phone number or password. Please check your credentials and try again.";
      } else if (error.code === 'auth/user-disabled') {
        errorTitle = "Account Disabled";
        errorMessage = "Your account has been disabled. Please contact support for assistance.";
      } else if (error.code === 'auth/too-many-requests') {
        errorTitle = "Too Many Requests";
        errorMessage = "We have blocked all requests from this device due to unusual activity. Try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorTitle = "Network Error";
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (error.code === 'auth/internal-error') {
        errorTitle = "Service Unavailable";
        errorMessage = "The authentication service is temporarily unavailable. Please try again later.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your phone number and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSignin}>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                required
                value={phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                maxLength={10}
                disabled={loading}
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <span className="text-sm text-red-500">{formErrors.phone}</span>
              )}
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password *</Label>
                <Link 
                  href="/en/forgot-password" 
                  className="text-sm underline hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                className={formErrors.password ? 'border-red-500' : ''}
              />
              {formErrors.password && (
                <span className="text-sm text-red-500">{formErrors.password}</span>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link 
              href="/en/signup" 
              className="underline hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
