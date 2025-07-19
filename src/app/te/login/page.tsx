
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import React from 'react';


export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          if (userCredential.user.emailVerified) {
            localStorage.setItem('isAuthenticated', 'true');
            router.push('/te/dashboard');
          } else {
            await signOut(auth);
            localStorage.removeItem('isAuthenticated');
            toast({
              title: "ఇమెయిల్ ధృవీకరించబడలేదు",
              description: "దయచేసి లాగిన్ చేయడానికి ముందు మీ ఇమెయిల్‌ను ధృవీకరించండి.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error("Login Error:", error);
          toast({
            title: "లాగిన్ విఫలమైంది",
            description: error.message,
            variant: "destructive",
          });
        }
    };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">లాగిన్</CardTitle>
          <CardDescription>మీ ఖాతాలోకి లాగిన్ అవ్వడానికి మీ ఇమెయిల్‌ను నమోదు చేయండి</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="email">ఇమెయిల్</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue="r.kumar@example.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">పాస్‌వర్డ్</Label>
                <Link href="/te/forgot-password" className="ml-auto inline-block text-sm underline hover:text-primary">
                  మీ పాస్‌వర్డ్ మర్చిపోయారా?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              లాగిన్
            </Button>
            <Button variant="outline" className="w-full">
              ఫోన్‌తో లాగిన్ అవ్వండి (OTP)
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ఖాతా లేదా?{' '}
            <Link href="/te/signup" className="underline hover:text-primary">
              నమోదు చేసుకోండి
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
