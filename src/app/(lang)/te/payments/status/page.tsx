
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentAndUpdate } from "@/lib/cashfree";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function PaymentStatusContentTe() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const order_id = searchParams.get('order_id');

    useEffect(() => {
        if (!order_id) {
            setStatus('error');
            setMessage('ఆర్డర్ ID కనుగొనబడలేదు. చెల్లని చెల్లింపు URL.');
            return;
        }

        const verify = async () => {
            try {
                const result = await verifyPaymentAndUpdate(order_id);
                if (result.success) {
                    setStatus('success');
                    setMessage(result.message || 'మీ చెల్లింపు విజయవంతమైంది మరియు మీ సభ్యత్వం ఇప్పుడు చురుకుగా ఉంది!');
                     toast({
                        title: "చెల్లింపు విజయవంతమైంది!",
                        description: "మీ సభ్యత్వం సక్రియం చేయబడింది.",
                        variant: 'default',
                    });
                     setTimeout(() => {
                        router.replace('/te/dashboard');
                    }, 3000);

                } else {
                    setStatus('failed');
                    setMessage(result.message || 'మీ చెల్లింపు నిర్ధారించబడలేదు. దయచేసి మీ ఖాతాను తనిఖీ చేయండి లేదా మద్దతును సంప్రదించండి.');
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'మీ చెల్లింపును ధృవీకరించేటప్పుడు ఊహించని లోపం సంభవించింది.');
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
                        {status === 'loading' && 'చెల్లింపును ధృవీకరిస్తోంది...'}
                        {status === 'success' && 'చెల్లింపు విజయవంతమైంది!'}
                        {status === 'failed' && 'చెల్లింపు విఫలమైంది'}
                        {status === 'error' && 'ఒక లోపం సంభవించింది'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' ? 'దయచేసి మేము మీ లావాదేవీని నిర్ధారించే వరకు వేచి ఉండండి. ఈ విండోను మూసివేయవద్దు.' : message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'success' && (
                        <p className="text-sm text-muted-foreground">మిమ్మల్ని మీ డాష్‌బోర్డ్‌కు మళ్ళిస్తున్నాము...</p>
                    )}
                    {(status === 'failed' || status === 'error') && (
                        <Button asChild>
                            <Link href="/te/dashboard">డాష్‌బోర్డ్‌కు వెళ్లండి</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentStatusPageTe() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">చెల్లింపు స్థితిని లోడ్ చేస్తోంది...</div>}>
      <PaymentStatusContentTe />
    </Suspense>
  );
}
