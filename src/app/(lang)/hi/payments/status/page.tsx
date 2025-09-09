
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentAndUpdate } from "@/lib/cashfree";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function PaymentStatusContentHi() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const order_id = searchParams.get('order_id');

    useEffect(() => {
        if (!order_id) {
            setStatus('error');
            setMessage('कोई ऑर्डर आईडी नहीं मिली। अमान्य भुगतान यूआरएल।');
            return;
        }

        const verify = async () => {
            try {
                const result = await verifyPaymentAndUpdate(order_id);
                if (result.success) {
                    setStatus('success');
                    setMessage(result.message || 'आपका भुगतान सफल रहा और आपकी सदस्यता अब सक्रिय है!');
                     toast({
                        title: "भुगतान सफल!",
                        description: "आपकी सदस्यता सक्रिय कर दी गई है।",
                        variant: 'default',
                    });
                     setTimeout(() => {
                        router.replace('/hi/dashboard');
                    }, 3000);

                } else {
                    setStatus('failed');
                    setMessage(result.message || 'आपके भुगतान की पुष्टि नहीं हो सकी। कृपया अपना खाता जांचें या सहायता से संपर्क करें।');
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'आपके भुगतान की पुष्टि करते समय एक अप्रत्याशित त्रुटि हुई।');
            }
        };

        verify();
    }, [order_id, router, toast]);
    
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    {status === 'loading' && <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />}
                    {status === 'success' && <CheckCircle className="mx-auto h-12 w-12 text-green-500" />}
                    {status === 'failed' && <XCircle className="mx-auto h-12 w-12 text-destructive" />}
                    {status === 'error' && <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />}
                    
                    <CardTitle className="mt-4 text-2xl font-headline">
                        {status === 'loading' && 'भुगतान की पुष्टि हो रही है...'}
                        {status === 'success' && 'भुगतान सफल!'}
                        {status === 'failed' && 'भुगतान विफल'}
                        {status === 'error' && 'एक त्रुटि हुई'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' ? 'कृपया प्रतीक्षा करें जब तक हम आपके लेनदेन की पुष्टि करते हैं। इस विंडो को बंद न करें।' : message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'success' && (
                        <p className="text-sm text-muted-foreground">आपको आपके डैशबोर्ड पर रीडायरेक्ट किया जा रहा है...</p>
                    )}
                    {(status === 'failed' || status === 'error') && (
                        <Button asChild>
                            <Link href="/hi/dashboard">डैशबोर्ड पर जाएं</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentStatusPageHi() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">भुगतान स्थिति लोड हो रही है...</div>}>
      <PaymentStatusContentHi />
    </Suspense>
  );
}
