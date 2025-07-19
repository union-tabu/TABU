
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "పాస్‌వర్డ్ రీసెట్ ఇమెయిల్ పంపబడింది",
        description: "ఆ ఇమెయిల్ కోసం ఖాతా ఉన్నట్లయితే, రీసెట్ లింక్ పంపబడింది. దయచేసి మీ ఇన్‌బాక్స్‌ను తనిఖీ చేయండి.",
      });
      router.push('/te/login');
    } catch (error: any) {
      console.error("Password Reset Error:", error);
      toast({
        title: "లోపం",
        description: "పాస్‌వర్డ్ రీసెట్ ఇమెయిల్ పంపడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-background px-4 py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">పాస్‌వర్డ్ మర్చిపోయారా</CardTitle>
          <CardDescription>మీ ఇమెయిల్‌ను నమోదు చేయండి మరియు మీ పాస్‌వర్డ్‌ను రీసెట్ చేయడానికి మేము మీకు ఒక లింక్‌ను పంపుతాము.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleResetPassword}>
            <div className="grid gap-2">
              <Label htmlFor="email">ఇమెయిల్</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              రీసెట్ లింక్ పంపండి
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            మీ పాస్‌వర్డ్ గుర్తుందా?{' '}
            <Link href="/te/login" className="underline hover:text-primary">
              లాగిన్
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
