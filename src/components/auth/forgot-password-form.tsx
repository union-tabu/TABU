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

const FAKE_EMAIL_DOMAIN = "@sanghika.samakhya";

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
      // Cleanup reCAPTCHA verifier
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

    // Phone validation
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number starting with 6-9';
    }

    // OTP validation (if OTP is sent)
    if (otpSent && !formData.otp) {
      errors.otp = 'OTP is required';
    } else if (otpSent && !/^\d{6}$/.test(formData.otp)) {
      errors.otp = 'OTP must be exactly 6 digits';
    }

    // Password validation (if OTP is sent)
    if (otpSent) {
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
        errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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
    
    // Clear error for this field when user starts typing
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      // Check in Firestore users collection
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
        'callback': () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // reCAPTCHA expired
          toast({
            title: "Security Verification Expired",
            description: "Please try sending OTP again.",
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
      toast({
        title: "Form Validation Failed",
        description: "Please correct the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if phone number exists in our system
      const phoneExists = await checkPhoneExists(formData.phone);
      
      if (!phoneExists) {
        toast({
          title: "Phone Number Not Found",
          description: "No account found with this phone number. Please check and try again or create a new account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Setup reCAPTCHA
      setupRecaptcha();
      
      const fullPhoneNumber = `+91${formData.phone}`;
      
      if (!window.recaptchaVerifier) {
        throw new Error('Security verification not initialized');
      }

      window.confirmationResult = await signInWithPhoneNumber(
        auth, 
        fullPhoneNumber, 
        window.recaptchaVerifier
      );
      
      setOtpSent(true);
      startResendTimer();
      
      toast({
        title: "OTP Sent Successfully",
        description: `A 6-digit verification code has been sent to +91${formData.phone} for password reset`,
      });

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      let errorTitle = 'OTP Send Failed';
      
      if (error.code === 'auth/captcha-check-failed' || error.code === 'auth/internal-error') {
        errorTitle = 'Security Verification Failed';
        errorMessage = "Security verification failed. Please ensure your domain is authorized in Firebase console and try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorTitle = 'Too Many Requests';
        errorMessage = 'Too many SMS requests. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorTitle = 'Invalid Phone Number';
        errorMessage = 'The phone number format is invalid. Please check and try again.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorTitle = 'SMS Quota Exceeded';
        errorMessage = 'SMS quota exceeded. Please try again later or contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
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
        throw new Error('Security verification not initialized');
      }

      window.confirmationResult = await signInWithPhoneNumber(
        auth, 
        fullPhoneNumber, 
        window.recaptchaVerifier
      );
      
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
    
    if (!validateForm()) {
      toast({
        title: "Form Validation Failed",
        description: "Please correct the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult;
      
      if (!confirmationResult) {
        throw new Error("OTP verification not initialized. Please request a new OTP.");
      }

      // Verify OTP - this will sign in the user temporarily
      const userCredential = await confirmationResult.confirm(formData.otp);
      const user = userCredential.user;
      
      setPhoneVerified(true);
      
      // Update the password for the current user
      await updatePassword(user, formData.newPassword);
      
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated successfully. Redirecting to login...",
      });

      // Sign out the user after password reset for security
      await auth.signOut();

      // Redirect to login page after successful password reset
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);

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
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorTitle = "Session Expired";
        errorMessage = "For security reasons, please request a new OTP and try again.";
        // Reset the form to allow new OTP request
        setOtpSent(false);
        setPhoneVerified(false);
      } else if (error.code === 'auth/network-request-failed') {
        errorTitle = "Network Error";
        errorMessage = "Network error occurred. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
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
          <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
          <CardDescription>
            {otpSent 
              ? "Enter the OTP sent to your phone and set your new password" 
              : "Enter your phone number to receive a password reset code"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
            {/* Phone Number Input */}
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
            
            {/* OTP and New Password Section */}
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
                  <span className="text-sm text-gray-600">
                    OTP sent to +91{formData.phone}
                  </span>
                </div>

                <div className="grid gap-4">
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
                </div>
                
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <strong>Password Requirements:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                  </ul>
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
            <Link href="/login" className="underline hover:text-primary">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
