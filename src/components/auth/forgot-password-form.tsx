// src/components/auth/forgot-password-form.tsx
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
  updatePassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const FAKE_EMAIL_DOMAIN = "@tabu";

interface FormData {
  phone: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const recaptchaRendered = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number starting with 6-9';
    }

    if (otpSent && !formData.otp) {
      errors.otp = 'OTP is required';
    } else if (otpSent && !/^\d{6}$/.test(formData.otp)) {
      errors.otp = 'OTP must be exactly 6 digits';
    }

    if (otpSent) {
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", phone));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking phone existence:', error);
      return false;
    }
  };

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
       window.recaptchaVerifier.clear();
    }
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {
          toast({
            title: "reCAPTCHA Expired",
            description: "Please try sending the OTP again.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      throw new Error('Failed to initialize security verification');
    }
  };

  const startResendTimer = () => {
    setOtpResendTimer(60);
    timerRef.current = setInterval(() => {
      setOtpResendTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const phoneExists = await checkPhoneExists(formData.phone);
      
      if (!phoneExists) {
        toast({
          title: "Phone Number Not Found",
          description: "No account is associated with this phone number. Please check the number or sign up.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setupRecaptcha();
      const fullPhoneNumber = `+91${formData.phone}`;
      
      if (!window.recaptchaVerifier) {
        throw new Error('Security verification (reCAPTCHA) is not initialized.');
      }

      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
      
      setOtpSent(true);
      startResendTimer();
      
      toast({
        title: "OTP Sent Successfully",
        description: `A 6-digit verification code has been sent to +91${formData.phone}.`,
      });

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = 'Failed to send OTP. Please try again later.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many SMS requests have been sent. Please wait a few minutes before trying again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "OTP Send Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    setLoading(true);
    
    try {
      setupRecaptcha();
      const fullPhoneNumber = `+91${formData.phone}`;
      
      if (!window.recaptchaVerifier) {
        throw new Error('Security verification not initialized.');
      }

      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
      startResendTimer();
      
      toast({
        title: "OTP Resent Successfully",
        description: `A new verification code has been sent to +91${formData.phone}`,
      });

    } catch (error: any) {
      console.error("Error resending OTP:", error);
      let errorMessage = 'Failed to resend OTP. Please try again.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before requesting another OTP.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult;
      
      if (!confirmationResult) {
        throw new Error("OTP verification session has expired. Please request a new OTP.");
      }

      const userCredential = await confirmationResult.confirm(formData.otp);
      const user = userCredential.user;
      
      await updatePassword(user, formData.newPassword);
      
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated. Redirecting to sign in...",
      });

      await auth.signOut();
      router.push('/en/signin?reset=success');

    } catch (error: any) {
      console.error("Password Reset Error:", error);
      let errorMessage = "Failed to reset password. Please try again.";
      let errorTitle = "Password Reset Failed";
      
      if (error.code === 'auth/invalid-verification-code') {
        errorTitle = "Invalid OTP";
        errorMessage = "The OTP you entered is incorrect. Please check and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorTitle = "OTP Expired";
        errorMessage = "The OTP has expired. Please request a new one.";
      } else if (error.code === 'auth/weak-password') {
        errorTitle = "Weak Password";
        errorMessage = "Your new password is too weak. Please choose a stronger password as per the requirements.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorTitle = "Session Expired";
        errorMessage = "For security reasons, your session has expired. Please request a new OTP and try again.";
        setOtpSent(false);
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
      <Card className="mx-auto max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {otpSent 
              ? "Enter the OTP sent to your phone and set your new password" 
              : "Enter your registered phone number to receive a password reset code"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="9876543210" 
                required 
                onChange={handleInputChange} 
                value={formData.phone} 
                disabled={otpSent}
                maxLength={10}
                className={formErrors.phone ? 'border-red-500' : ''}
              />
              {formErrors.phone && (
                <span className="text-sm text-red-500">{formErrors.phone}</span>
              )}
            </div>
            
            {otpSent && (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp">Enter OTP *</Label>
                    {otpResendTimer > 0 ? (
                      <span className="text-sm text-gray-500">
                        Resend in {otpResendTimer}s
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-primary hover:text-primary/80"
                      >
                        Resend OTP
                      </Button>
                    )}
                  </div>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="123456" 
                    required 
                    onChange={handleInputChange} 
                    value={formData.otp} 
                    maxLength={6}
                    className={formErrors.otp ? 'border-red-500' : ''}
                  />
                  {formErrors.otp && (
                    <span className="text-sm text-red-500">{formErrors.otp}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    required 
                    onChange={handleInputChange} 
                    value={formData.newPassword}
                    className={formErrors.newPassword ? 'border-red-500' : ''}
                  />
                  {formErrors.newPassword && (
                    <span className="text-sm text-red-500">{formErrors.newPassword}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    required 
                    onChange={handleInputChange} 
                    value={formData.confirmPassword}
                    className={formErrors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {formErrors.confirmPassword && (
                    <span className="text-sm text-red-500">{formErrors.confirmPassword}</span>
                  )}
                </div>
              </>
            )}

            <div id="recaptcha-container"></div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {otpSent ? 'Resetting Password...' : 'Sending OTP...'}
                </div>
              ) : (
                otpSent ? 'Reset Password' : 'Send OTP'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Remember your password?{' '}
            <Link href="/en/signin" className="underline hover:text-primary">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
