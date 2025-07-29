
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
import React from 'react';

const FAKE_EMAIL_DOMAIN = "@sanghika.samakhya";

export default function LoginFormTe() {
    const router = useRouter();
    const { toast } = useToast();
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        if (!/^[6-9]\d{9}$/.test(phone)) {
            toast({
                title: "చెల్లని ఫోన్ నంబర్",
                description: "దయచేసి చెల్లుబాటు అయ్యే 10-అంకెల భారతీయ ఫోన్ నంబర్‌ను నమోదు చేయండి.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const email = `${phone}${FAKE_EMAIL_DOMAIN}`;
            await signInWithEmailAndPassword(auth, email, password);
            
            router.push('/te/dashboard');
            
        } catch (error: any) {
            console.error("Login Error:", error);
            let errorMessage = "తెలియని లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "తప్పు ఫోన్ నంబర్ లేదా పాస్‌వర్డ్. దయచేసి మీ వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "చాలా విఫలమైన లాగిన్ ప్రయత్నాల కారణంగా ఈ ఖాతాకు యాక్సెస్ తాత్కాలికంగా నిలిపివేయబడింది. మీరు మీ పాస్‌వర్డ్‌ను రీసెట్ చేయడం ద్వారా దాన్ని వెంటనే పునరుద్ధరించవచ్చు లేదా మీరు తర్వాత మళ్లీ ప్రయత్నించవచ్చు.";
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
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background px-4 py-12">
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
                        pattern="[6-9]{1}[0-9]{9}"
                        title="దయచేసి చెల్లుబాటు అయ్యే 10-అంకెల భారతీయ ఫోన్ నంబర్‌ను నమోదు చేయండి"
                        maxLength={10}
                    />
                </div>
                 <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">పాస్‌వర్డ్</Label>
                        <Link href="/te/forgot-password"
                            className="text-sm underline hover:text-primary">
                            పాస్వర్డ్ మర్చిపోయారా?
                        </Link>
                    </div>
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
