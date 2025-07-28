
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { add } from 'date-fns';

// This is a workaround domain for phone+password auth.
const FAKE_EMAIL_DOMAIN = '@sanghika.samakhya';


export default function SignupFormTe() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('yearly');

  useEffect(() => {
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl === 'monthly' || planFromUrl === 'yearly') {
      setPlan(planFromUrl);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    country: 'భారతదేశం',
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
            title: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు",
            description: "దయచేసి మీ పాస్‌వర్డ్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
            variant: "destructive",
        });
        return;
    }
    
    setLoading(true);

    try {
        const email = `${formData.phone}${FAKE_EMAIL_DOMAIN}`;
        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
        const user = userCredential.user;

        const renewalDate = plan === 'monthly' ? add(new Date(), { months: 1 }) : add(new Date(), { years: 1 });
        
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await setDoc(doc(db, "users", user.uid), {
            firstName: firstName,
            lastName: lastName,
            email: email, // Store fake email
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pin}`,
            createdAt: new Date(),
            subscription: {
                plan: plan,
                status: 'active',
                renewalDate: renewalDate,
            }
        });
        
        toast({
            title: "ఖాతా సృష్టించబడింది!",
            description: "మీరు విజయవంతంగా నమోదు చేసుకున్నారు. దయచేసి లాగిన్ చేయండి.",
        });

        router.push('/te/login');

    } catch (error: any) {
        console.error("Signup Error:", error);
        let errorMessage = "తెలియని లోపం సంభవించింది.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "ఈ ఫోన్ నంబర్ ఇప్పటికే నమోదు చేయబడింది. దయచేసి బదులుగా లాగిన్ చేయండి.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "పాస్‌వర్డ్ చాలా బలహీనంగా ఉంది. దయచేసి కనీసం 6 అక్షరాలను ఉపయోగించండి.";
        }
        toast({
            title: "నమోదు విఫలమైంది",
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
          <CardTitle className="text-2xl font-headline">కొత్త ఖాతాను సృష్టించండి</CardTitle>
          <CardDescription>
            ఖాతాను సృష్టించడానికి మీ సమాచారాన్ని నమోదు చేయండి.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form className="grid gap-4" onSubmit={handleSignup}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="fullName">పూర్తి పేరు</Label>
                      <Input id="fullName" placeholder="పేరు ఇంటిపేరు" required onChange={handleInputChange} value={formData.fullName} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="phone">ఫోన్</Label>
                      <Input id="phone" type="tel" placeholder="987-654-3210" required onChange={handleInputChange} value={formData.phone}/>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="password">పాస్‌వర్డ్</Label>
                      <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">పాస్‌వర్డ్‌ను నిర్ధారించండి</Label>
                      <Input id="confirmPassword" type="password" required onChange={handleInputChange} value={formData.confirmPassword}/>
                  </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">చిరునామా</Label>
                <Input id="address" placeholder="11-2-333, ల్యాండ్‌మార్క్" required onChange={handleInputChange} value={formData.address} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="city">నగరం</Label>
                      <Input id="city" placeholder="హైదరాబాద్" required onChange={handleInputChange} value={formData.city}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="state">రాష్ట్రం</Label>
                      <Input id="state" placeholder="తెలంగాణ" required onChange={handleInputChange} value={formData.state}/>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="country">దేశం</Label>
                      <Input id="country" placeholder="భారతదేశం" required onChange={handleInputChange} value={formData.country}/>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="pin">పిన్</Label>
                      <Input id="pin" placeholder="500089" required onChange={handleInputChange} value={formData.pin}/>
                  </div>
              </div>
              
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? 'ఖాతా సృష్టిస్తోంది...' : 'ఖాతాను సృష్టించండి'}
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
