"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect } from 'react';

const FAKE_EMAIL_DOMAIN = "@tabu";

export default function SigninFormHi() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (searchParams.get('reset') === 'success') {
        toast({
            title: "पासवर्ड रीसेट सफल!",
            description: "अब आप अपने नए पासवर्ड से साइन इन कर सकते हैं।",
        });
        router.replace('/hi/signin', { scroll: false });
        }
    }, [searchParams, router, toast]);

    const handleSignin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        if (!/^[6-9]\d{9}$/.test(phone)) {
            toast({
                title: "अमान्य फ़ोन नंबर",
                description: "कृपया एक मान्य 10-अंकीय भारतीय फ़ोन नंबर दर्ज करें।",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const email = `${phone}${FAKE_EMAIL_DOMAIN}`;
            await signInWithEmailAndPassword(auth, email, password);
            
            toast({
                title: "साइन इन सफल!",
                description: "स्वागत है! डैशबोर्ड पर रीडायरेक्ट किया जा रहा है...",
            });
            router.push('/hi/dashboard');
            
        } catch (error: any) {
            console.error("Signin Error:", error);
            let errorMessage = "एक अज्ञात त्रुटि हुई। कृपया पुनः प्रयास करें।";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "गलत फ़ोन नंबर या पासवर्ड। कृपया अपने क्रेडेंशियल जांचें और पुनः प्रयास करें।";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "बहुत सारे असफल साइन-इन प्रयासों के कारण इस खाते तक पहुंच अस्थायी रूप से अक्षम कर दी गई है। कृपया कुछ मिनट प्रतीक्षा करें और पुनः प्रयास करें।";
            }
            toast({
                title: "साइन इन विफल",
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
          <CardTitle className="text-2xl font-headline">साइन इन</CardTitle>
          <CardDescription>साइन इन करने के लिए अपना फ़ोन नंबर और पासवर्ड दर्ज करें</CardDescription>
        </CardHeader>
        <CardContent>
            <form className="grid gap-4" onSubmit={handleSignin}>
                <div className="grid gap-2">
                    <Label htmlFor="phone">फ़ोन नंबर</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        pattern="[6-9]{1}[0-9]{9}"
                        title="कृपया एक मान्य 10-अंकीय भारतीय फ़ोन नंबर दर्ज करें"
                        maxLength={10}
                    />
                </div>
                 <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">पासवर्ड</Label>
                        <Link href="/hi/forgot-password"
                            className="text-sm underline hover:text-primary">
                            पासवर्ड भूल गए?
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
                    {loading ? 'साइन इन हो रहा है...' : 'साइन इन'}
                </Button>
            </form>
          <div className="mt-4 text-center text-sm">
            खाता नहीं है?{' '}
            <Link href="/hi/signup" className="underline hover:text-primary">
              पंजीकरण करें
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
