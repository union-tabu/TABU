
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentAndUpdate } from "@/lib/cashfree";
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type PaymentStatus = 'loading' | 'success' | 'failed' | 'error' | 'pending';

interface VerificationResult {
    success: boolean;
    status?: string;
    message?: string;
}

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState<PaymentStatus>('loading');
    const [message, setMessage] = useState('');
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const order_id = searchParams.get('order_id');

    const verifyPayment = useCallback(async (orderId: string, isRetry = false) => {
        try {
            if (isRetry) {
                setIsRetrying(true);
            } else {
                setStatus('loading');
            }

            console.log('Verifying payment for order:', orderId);
            
            const result: VerificationResult = await verifyPaymentAndUpdate(orderId);
            
            console.log('Verification result:', result);

            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'Your payment was successful and your subscription is now active!');
                
                toast({
                    title: "Payment Successful!",
                    description: "Your subscription has been activated.",
                    variant: 'default',
                });

                // Redirect after showing success message
                setTimeout(() => {
                    router.replace('/en/dashboard');
                }, 3000);

            } else {
                // Handle different failure scenarios
                const resultStatus = result.status?.toUpperCase();
                
                if (resultStatus === 'PENDING' || resultStatus === 'ACTIVE') {
                    setStatus('pending');
                    setMessage(result.message || 'Payment is still being processed. Please wait...');
                    
                    // Auto-retry for pending payments (max 5 times)
                    if (retryCount < 5) {
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                            verifyPayment(orderId, true);
                        }, 10000); // Retry after 10 seconds
                    }
                } else if (resultStatus === 'ORDER_NOT_FOUND' || resultStatus === 'NOT_FOUND') {
                    setStatus('error');
                    setMessage('Payment record not found. If you made a payment, please contact support with your order details.');
                } else if (resultStatus === 'ALREADY_PROCESSED') {
                    setStatus('success');
                    setMessage(result.message || 'Payment already verified. Your subscription is active.');
                    
                    setTimeout(() => {
                        router.replace('/en/dashboard');
                    }, 3000);
                } else {
                    setStatus('failed');
                    setMessage(result.message || 'Your payment could not be confirmed. Please check your account or contact support.');
                }
            }
        } catch (err: any) {
            console.error('Payment verification error:', err);
            setStatus('error');
            setMessage(err.message || 'An unexpected error occurred while verifying your payment.');
        } finally {
            setIsRetrying(false);
        }
    }, [router, toast, retryCount]);

    const handleRetry = useCallback(() => {
        if (order_id && !isRetrying) {
            verifyPayment(order_id, true);
        }
    }, [order_id, verifyPayment, isRetrying]);

    useEffect(() => {
        if (!order_id) {
            setStatus('error');
            setMessage('No order ID found. Invalid payment URL.');
            return;
        }

        // Validate order ID format
        if (typeof order_id !== 'string' || order_id.length < 10) {
            setStatus('error');
            setMessage('Invalid order ID format. Please check your payment link.');
            return;
        }

        // Reset retry count when order_id changes
        setRetryCount(0);
        
        // Start verification
        verifyPayment(order_id);
    }, [order_id, verifyPayment]);

    const getIconComponent = () => {
        switch (status) {
            case 'loading':
                return <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />;
            case 'success':
                return <CheckCircle className="mx-auto h-12 w-12 text-green-500" />;
            case 'failed':
                return <XCircle className="mx-auto h-12 w-12 text-destructive" />;
            case 'pending':
                return isRetrying ? 
                    <RefreshCw className="mx-auto h-12 w-12 animate-spin text-blue-500" /> :
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />;
            case 'error':
            default:
                return <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />;
        }
    };

    const getTitle = () => {
        switch (status) {
            case 'loading':
                return 'Verifying Payment...';
            case 'success':
                return 'Payment Successful!';
            case 'failed':
                return 'Payment Failed';
            case 'pending':
                return isRetrying ? 'Rechecking Payment...' : 'Payment Pending';
            case 'error':
            default:
                return 'An Error Occurred';
        }
    };

    const getDescription = () => {
        if (status === 'loading') {
            return 'Please wait while we confirm your transaction. Do not close this window.';
        }
        if (status === 'pending' && retryCount > 0) {
            return `${message} (Attempt ${retryCount + 1}/6)`;
        }
        return message;
    };
    
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    {getIconComponent()}
                    
                    <CardTitle className="mt-4 text-2xl">
                        {getTitle()}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {getDescription()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'success' && (
                        <p className="text-sm text-muted-foreground">
                            Redirecting you to your dashboard in a few seconds...
                        </p>
                    )}
                    
                    {status === 'pending' && !isRetrying && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Your payment is being processed. We'll automatically check again in a few seconds.
                            </p>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleRetry}
                                disabled={isRetrying}
                            >
                                Check Now
                            </Button>
                        </div>
                    )}
                    
                    {(status === 'failed' || status === 'error') && (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleRetry}
                                    disabled={isRetrying}
                                    className="w-full"
                                >
                                    {isRetrying ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        'Try Again'
                                    )}
                                </Button>
                                <Button asChild className="w-full">
                                    <Link href="/en/dashboard">Go to Dashboard</Link>
                                </Button>
                            </div>
                            {order_id && (
                                <p className="text-xs text-muted-foreground">
                                    Order ID: {order_id}
                                </p>
                            )}
                        </div>
                    )}

                    {status === 'loading' && (
                        <div className="text-xs text-muted-foreground">
                            This may take up to 30 seconds...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense 
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="w-full max-w-md text-center">
                        <CardHeader>
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                            <CardTitle className="mt-4">Loading Payment Status...</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            }
        >
            <PaymentStatusContent />
        </Suspense>
    );
}
