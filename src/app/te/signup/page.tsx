
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { add } from 'date-fns';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const firstName = (form.elements.namedItem('first-name') as HTMLInputElement).value;
    const lastName = (form.elements.namedItem('last-name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      toast({
        title: "బలహీనమైన పాస్‌వర్డ్",
        description: "పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి మరియు కనీసం ఒక పెద్ద అక్షరం, ఒక చిన్న అక్షరం, ఒక సంఖ్య, మరియు ఒక ప్రత్యేక అక్షరం కలిగి ఉండాలి.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const plan = searchParams.get('plan') || 'yearly';
      const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });

      // Add user to "users" collection in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        address: "42 మెయిన్ స్ట్రీట్, వర్కర్స్ సిటీ", // Default address
        createdAt: new Date(),
        subscription: {
          plan: plan,
          status: 'active',
          renewalDate: renewalDate,
        }
      });
      
      await sendEmailVerification(user);
      
      toast({
        title: "ధృవీకరణ ఇమెయిల్ పంపబడింది",
        description: "దయచేసి మీ ఇమెయిల్ చిరునామాను ధృవీకరించడానికి మీ ఇన్‌బాక్స్‌ను తనిఖీ చేయండి.",
      });

      router.push('/te/login');

    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
        title: "నమోదు విఫలమైంది",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">నమోదు చేసుకోండి</CardTitle>
          <CardDescription>ఖాతాను సృష్టించడానికి మీ సమాచారాన్ని నమోదు చేయండి</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSignup}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">మొదటి పేరు</Label>
                <Input id="first-name" placeholder="పేరు" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">ఇంటి పేరు</Label>
                <Input id="last-name" placeholder="ఇంటిపేరు" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">ఇమెయిల్</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">ఫోన్ నంబర్</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">పాస్‌వర్డ్</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                పెద్ద, చిన్న అక్షరం, సంఖ్య, మరియు ప్రత్యేక అక్షరంతో 8+ అక్షరాలు ఉండాలి.
              </p>
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              ఖాతాను సృష్టించండి
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ఇప్పటికే ఖాతా ఉందా?{' '}
            <Link href="/te/login" className="underline hover:text-primary">
              లాగిన్
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
