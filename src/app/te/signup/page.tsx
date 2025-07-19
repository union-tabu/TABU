
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
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
            <div className="grid grid-cols-2 gap-4">
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
              <Input id="password" type="password" required />
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
