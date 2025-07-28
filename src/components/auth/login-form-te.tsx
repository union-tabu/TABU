
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
import React, { useState } from 'react';

// This is a workaround domain for phone+password auth.
const FAKE_EMAIL_DOMAIN = '@sanghika.samakhya';

export default function LoginFormTe() {
    const router = useRouter();
    const { toast } = useToast();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Construct the fake email from the phone number
            const email = `${phone}${FAKE_EMAIL_DOMAIN}`;
            
            await signInWithEmailAndPassword(auth, email, password);
            
            localStorage.setItem('isAuthenticated', 'true');
            router.push('/te/dashboard');
            toast({
                title: "లాగిన్ విజయవంతమైంది",
                description: "మీరు విజయవంతంగా లాగిన్ అయ్యారు.",
            });
        } catch (error: any) {
            console.error("Login Error:", error);
            let errorMessage = "తెలియని లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "తప్పు ఫోన్ నంబర్ లేదా పాస్‌వర్డ్. దయచేసి మీ వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
            }
            toast({
                title: "లాగిన్ విఫలమైంది",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">లాగిన్</CardTitle>
          <CardDescription>లాగిన్ చేయడానికి మీ ఫోన్ నంబర్ మరియు పాస్‌వర్డ్‌ను నమోదు చేయండి</CardDescription>
        </CardHeader>
        <CardContent>
            <form className="grid gap-4" onSubmit={handleLogin}>
                <div className="grid gap-2">
                    <Label htmlFor="phone">ఫోన్ నంబర్</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">పాస్‌వర్డ్</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? 'లాగిన్ అవుతోంది...' : 'లాగిన్'}
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
