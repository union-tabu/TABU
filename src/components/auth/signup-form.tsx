// src/components/auth/signup-form.tsx
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
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail 
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  fullName: string;
  phone: string;
  otp: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pin: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function SignupForm() {
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
      console.log('🔥 FIREBASE AUTH DOMAIN:', window.location.hostname);
      console.log('Add the domain above to your Firebase Console -> Authentication -> Settings -> Authorized domains');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Cleanup reCAPTCHA verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
      errors.fullName = 'Full name can only contain letters and spaces';
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number starting with 6-9';
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Please enter a complete address (minimum 10 characters)';
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      errors.city = 'City name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
      errors.city = 'City name can only contain letters and spaces';
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    } else if (formData.state.trim().length < 2) {
      errors.state = 'State name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.state.trim())) {
      errors.state = 'State name can only contain letters and spaces';
    }

    // PIN validation
    if (!formData.pin) {
      errors.pin = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pin)) {
      errors.pin = 'PIN code must be exactly 6 digits';
    }

    // OTP validation (if OTP is sent)
    if (otpSent && !formData.otp) {
      errors.otp = 'OTP is required';
    } else if (otpSent && !/^\d{6}$/.test(formData.otp)) {
      errors.otp = 'OTP must be exactly 6 digits';
    }

    // Password validation (if OTP is sent)
    if (otpSent) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
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
      
      if (!querySnapshot.empty) {
        return true;
      }

      // Also check Firebase Auth using fake email
      const email = `${phone}${FAKE_EMAIL_DOMAIN}`;
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      return signInMethods.length > 0;
    } catch (error) {
      console.error('Error checking phone existence:', error);
      // If we can't check, assume it doesn't exist to allow the process to continue
      return false;
    }
  };

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier || recaptchaRendered.current) {
      return;
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
      recaptchaRendered.current = true;
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
      // CRITICAL: Check if phone number already exists BEFORE sending OTP
      const phoneExists = await checkPhoneExists(formData.phone);
      
      if (phoneExists) {
        toast({
          title: "Phone Number Already Registered",
          description: "An account with this phone number already exists. Redirecting to login page.",
          variant: "destructive",
        });
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // Setup reCAPTCHA only after confirming phone doesn't exist
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
        description: `A 6-digit verification code has been sent to +91${formData.phone}`,
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

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
        recaptchaRendered.current = false;
      }

    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;
    
    setLoading(true);
    
    try {
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
        recaptchaRendered.current = false;
      }

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

  const handleSignup = async (event: React.FormEvent) => {
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

      // Verify OTP
      await confirmationResult.confirm(formData.otp);
      setPhoneVerified(true);
      
      // Create Firebase Auth account
      const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;

      // Parse full name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        phone: formData.phone,
        address: `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()}, ${formData.country} - ${formData.pin}`,
        createdAt: new Date(),
        subscription: {
          status: 'not subscribed',
        },
        email: '' // Keep email empty as we're using phone
      });
      
      toast({
        title: "Account Created Successfully!",
        description: "Your account has been created. Redirecting to dashboard...",
      });

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error("Signup Error:", error);
      
      let errorMessage = "Failed to create account. Please try again.";
      let errorTitle = "Account Creation Failed";
      
      if (error.code === 'auth/invalid-verification-code') {
        errorTitle = "Invalid OTP";
        errorMessage = "The OTP you entered is incorrect. Please check and try again.";
      } else if (error.code === 'auth/code-expired') {
        errorTitle = "OTP Expired";
        errorMessage = "The OTP has expired. Please request a new one.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorTitle = "Account Already Exists";
        errorMessage = "An account with this phone number already exists. Please login instead.";
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (error.code === 'auth/weak-password') {
        errorTitle = "Weak Password";
        errorMessage = "Password is too weak. Please choose a stronger password.";
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
      <Card className="mx-auto max-w-2xl w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create New Account</CardTitle>
          <CardDescription>
            {otpSent 
              ? "Enter the OTP sent to your phone and create your password" 
              : "Enter your information to create an account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={otpSent ? handleSignup : handleSendOtp}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  required 
                  onChange={handleInputChange} 
                  value={formData.fullName} 
                  disabled={otpSent}
                  className={formErrors.fullName ? 'border-red-500' : ''}
                />
                {formErrors.fullName && (
                  <span className="text-sm text-red-500">{formErrors.fullName}</span>
                )}
              </div>
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
            </div>

            {/* Address Information */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input 
                id="address" 
                placeholder="11-2-333, Landmark, Street Name" 
                required 
                onChange={handleInputChange} 
                value={formData.address} 
                disabled={otpSent}
                className={formErrors.address ? 'border-red-500' : ''}
              />
              {formErrors.address && (
                <span className="text-sm text-red-500">{formErrors.address}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city" 
                  placeholder="Hyderabad" 
                  required 
                  onChange={handleInputChange} 
                  value={formData.city} 
                  disabled={otpSent}
                  className={formErrors.city ? 'border-red-500' : ''}
                />
                {formErrors.city && (
                  <span className="text-sm text-red-500">{formErrors.city}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input 
                  id="state" 
                  placeholder="Telangana" 
                  required 
                  onChange={handleInputChange} 
                  value={formData.state} 
                  disabled={otpSent}
                  className={formErrors.state ? 'border-red-500' : ''}
                />
                {formErrors.state && (
                  <span className="text-sm text-red-500">{formErrors.state}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  placeholder="India" 
                  required 
                  onChange={handleInputChange} 
                  value={formData.country} 
                  disabled={true}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pin">PIN Code *</Label>
                <Input 
                  id="pin" 
                  placeholder="500089" 
                  required 
                  onChange={handleInputChange} 
                  value={formData.pin} 
                  disabled={otpSent}
                  maxLength={6}
                  className={formErrors.pin ? 'border-red-500' : ''}
                />
                {formErrors.pin && (
                  <span className="text-sm text-red-500">{formErrors.pin}</span>
                )}
              </div>
            </div>
            
            {/* OTP and Password Section */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      onChange={handleInputChange} 
                      value={formData.password}
                      className={formErrors.password ? 'border-red-500' : ''}
                    />
                    {formErrors.password && (
                      <span className="text-sm text-red-500">{formErrors.password}</span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
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
                  {otpSent ? 'Creating Account...' : 'Verifying Phone...'}
                </div>
              ) : (
                otpSent ? 'Create Account' : 'Send OTP'
              )}
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
