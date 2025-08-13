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

const FAKE_EMAIL_DOMAIN = "@tabu";

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
  const [signinAttempts, setSigninAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

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

  // Handle signin attempt blocking
  useEffect(() => {
    const storedAttempts = localStorage.getItem('signinAttempts');
    const storedBlockTime = localStorage.getItem('signinBlockTime');
    
    if (storedAttempts) {
      setSigninAttempts(parseInt(storedAttempts));
    }
    
    if (storedBlockTime) {
      const blockTime = parseInt(storedBlockTime);
      const now = Date.now();
      
      if (now < blockTime) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.ceil((blockTime - now) / 1000));
        
        const timer = setInterval(() => {
          const remaining = Math.ceil((blockTime - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            setSigninAttempts(0);
            localStorage.removeItem('signinAttempts');
            localStorage.removeItem('signinBlockTime');
            clearInterval(timer);
          } else {
            setBlockTimeRemaining(remaining);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        // Block time expired, reset
        setSigninAttempts(0);
        localStorage.removeItem('signinAttempts');
        localStorage.removeItem('signinBlockTime');
      }
    }
  }, []);

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
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
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

  const handleFailedSignin = () => {
    const newAttempts = signinAttempts + 1;
    setSigninAttempts(newAttempts);
    localStorage.setItem('signinAttempts', newAttempts.toString());
    
    if (newAttempts >= 5) {
      // Block for 15 minutes after 5 failed attempts
      const blockUntil = Date.now() + (15 * 60 * 1000);
      localStorage.setItem('signinBlockTime', blockUntil.toString());
      setIsBlocked(true);
      setBlockTimeRemaining(15 * 60);
      
      toast({
        title: "Account Temporarily Locked",
        description: "Too many failed sign-in attempts. Your account has been temporarily locked for 15 minutes for security reasons.",
        variant: "destructive",
      });
    } else {
      const remainingAttempts = 5 - newAttempts;
      toast({
        title: "Invalid Credentials",
        description: `Invalid phone number or password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lock.`,
        variant: "destructive",
      });
    }
  };

  const handleSuccessfulSignin = () => {
    // Clear any stored signin attempts on successful signin
    setSigninAttempts(0);
    localStorage.removeItem('signinAttempts');
    localStorage.removeItem('signinBlockTime');
    
    toast({
      title: "Sign In Successful!",
      description: "Welcome back. Redirecting you to the dashboard...",
    });
    
    setTimeout(() => {
      router.push('/en/dashboard');
    }, 1000);
  };

  const handleSignin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isBlocked) {
      toast({
        title: "Account Temporarily Locked",
        description: `Please wait ${Math.ceil(blockTimeRemaining / 60)} minute(s) before trying again.`,
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Form Validation Failed",
        description: "Please correct the errors marked in red and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const email = `${phone}${FAKE_EMAIL_DOMAIN}`;
      
      // This will work with the linked credential approach
      await signInWithEmailAndPassword(auth, email, password);
      
      handleSuccessfulSignin();
      
    } catch (error: any) {
      console.error("Signin Error:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Sign In Failed";
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-email') {
        handleFailedSignin();
        setLoading(false); // Make sure to stop loading indicator
        return; // handleFailedSignin shows its own toast
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
      // Don't set loading to false if handleFailedSignin is called, as it does it itself.
      if (auth.currentUser === null) {
          setLoading(false);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            {isBlocked 
              ? `Account locked. Try again in ${formatTime(blockTimeRemaining)}`
              : "Enter your phone number and password to sign in"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBlocked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Account Temporarily Locked</h3>
                  <div className="mt-1 text-sm text-red-700">
                    Too many failed sign-in attempts. Please wait {formatTime(blockTimeRemaining)} before trying again.
                  </div>
                </div>
              </div>
            </div>
          )}

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
                disabled={loading || isBlocked}
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
                  tabIndex={isBlocked ? -1 : 0}
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
                disabled={loading || isBlocked}
                className={formErrors.password ? 'border-red-500' : ''}
              />
              {formErrors.password && (
                <span className="text-sm text-red-500">{formErrors.password}</span>
              )}
            </div>

            {signinAttempts > 0 && signinAttempts < 5 && !isBlocked && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                <strong>Warning:</strong> {5 - signinAttempts} attempt{5 - signinAttempts !== 1 ? 's' : ''} remaining before account lock.
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={loading || isBlocked}
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
              tabIndex={isBlocked ? -1 : 0}
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
