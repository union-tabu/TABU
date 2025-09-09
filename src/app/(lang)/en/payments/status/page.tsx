
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentAndUpdate } from "@/lib/cashfree";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const order_id = searchParams.get('order_id');

    useEffect(() => {
        if (!order_id) {
            setStatus('error');
            setMessage('No order ID found. Invalid payment URL.');
            return;
        }

        const verify = async () => {
            try {
                const result = await verifyPaymentAndUpdate(order_id);
                if (result.success) {
                    setStatus('success');
                    setMessage(result.message || 'Your payment was successful and your subscription is now active!');
                     toast({
                        title: "Payment Successful!",
                        description: "Your subscription has been activated.",
                        variant: 'default',
                    });
                     setTimeout(() => {
                        router.replace('/en/dashboard');
                    }, 3000);

                } else {
                    setStatus('failed');
                    setMessage(result.message || 'Your payment could not be confirmed. Please check your account or contact support.');
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'An unexpected error occurred while verifying your payment.');
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
                    
                    <CardTitle className="mt-4 text-2xl">
                        {status === 'loading' && 'Verifying Payment...'}
                        {status === 'success' && 'Payment Successful!'}
                        {status === 'failed' && 'Payment Failed'}
                        {status === 'error' && 'An Error Occurred'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' ? 'Please wait while we confirm your transaction. Do not close this window.' : message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'success' && (
                        <p className="text-sm text-muted-foreground">Redirecting you to your dashboard...</p>
                    )}
                    {(status === 'failed' || status === 'error') && (
                        <Button asChild>
                            <Link href="/en/dashboard">Go to Dashboard</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading payment status...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}

