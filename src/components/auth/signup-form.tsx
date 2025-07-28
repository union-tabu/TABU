
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';

// This is a workaround domain for phone+password auth.
const FAKE_EMAIL_DOMAIN = '@sanghika.samakhya';

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pin: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  }

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
        toast({
            title: "Passwords do not match",
            description: "Please check your password and try again.",
            variant: "destructive",
        });
        return;
    }

    setLoading(true);

    try {
        // Construct a fake email from the phone number
        const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
        
        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
        const user = userCredential.user;

        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: email, // Store the fake email
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pin}`,
            createdAt: new Date(),
            subscription: {
                status: 'not subscribed',
            }
        });
        
        toast({
            title: "Account Created!",
            description: "Welcome! Your account is ready. Please subscribe to activate your membership.",
        });

        // Redirect to subscribe page after login
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/dashboard/subscribe');

    } catch (error: any) {
        console.error("Signup Error:", error);
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This phone number is already registered. Please login instead.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "The password is too weak. Please use at least 6 characters.";
        }
        toast({
            title: "Signup Failed",
            description: errorMessage,
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
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSignup}>
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
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword}/>
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
              {loading ? 'Creating Account...' : 'Create Account'}
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
