
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { differenceInMonths, startOfMonth } from 'date-fns';
import { useRouter } from "next/navigation";

export default function SubscribePageHi() {
  const { userData, loading } = useAuth();
  const router = useRouter();

  const handlePlanSelection = (plan: 'monthly' | 'yearly') => {
    router.push(`/hi/order-summary?plan=${plan}`);
  };

  if (loading) {
     return (
      <div className="flex flex-col items-center justify-center w-full space-y-8">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full max-w-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (userData?.subscription?.status === 'active') {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">आप पहले से ही सदस्य हैं!</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    आप अपनी प्रोफ़ाइल से अपनी सदस्यता का प्रबंधन कर सकते हैं। आपकी वर्तमान योजना समाप्त होने के बाद नए भुगतान विकल्प यहां उपलब्ध होंगे।
                </p>
            </div>
            <SubscriptionStatusCard isHindi={true} />
        </div>
    );
  }
  
  let isLapsed = false;
  const PENALTY_FEE = 500;
  const MONTHLY_PRICE = 100;
  const YEARLY_PRICE = 1200;

  if (userData?.subscription?.status === 'pending') {
    const now = new Date();
    const gracePeriodStartDate = userData.subscription?.renewalDate
        ? new Date(userData.subscription.renewalDate.seconds * 1000)
        : new Date(userData.createdAt.seconds * 1000);

    if (differenceInMonths(startOfMonth(now), startOfMonth(gracePeriodStartDate)) >= 2) {
      isLapsed = true;
    }
  }

  const monthlyAmount = isLapsed ? MONTHLY_PRICE + PENALTY_FEE : MONTHLY_PRICE;
  const yearlyAmount = isLapsed ? YEARLY_PRICE + PENALTY_FEE : YEARLY_PRICE;

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">अपनी सदस्यता योजना चुनें</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          वह योजना चुनें जो आपके लिए सबसे उपयुक्त हो और तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन के आधिकारिक सदस्य बनें। अपनी यूनियन आईडी प्राप्त करें और सभी सदस्य लाभों को तुरंत अनलॉक करें।
        </p>
      </div>

       {isLapsed && (
          <Alert variant="destructive" className="max-w-4xl w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>पुनः सक्रियण शुल्क लागू</AlertTitle>
            <AlertDescription>
              आपका खाता दो महीने से अधिक समय से निष्क्रिय है। आपकी सदस्यता को पुनः सक्रिय करने के लिए ₹{PENALTY_FEE} का एकमुश्त शुल्क जोड़ा गया है।
            </AlertDescription>
          </Alert>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>मासिक योजना</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹{monthlyAmount}</p>
            <p className="text-muted-foreground">प्रति माह</p>
            {isLapsed && <p className="text-sm text-muted-foreground">(₹{MONTHLY_PRICE} योजना + ₹{PENALTY_FEE} शुल्क)</p>}
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={() => handlePlanSelection('monthly')}>
              योजना चुनें
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>वार्षिक योजना</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹{yearlyAmount}</p>
            <p className="text-muted-foreground">प्रति वर्ष</p>
            {isLapsed && <p className="text-sm text-muted-foreground">(₹{YEARLY_PRICE} योजना + ₹{PENALTY_FEE} शुल्क)</p>}
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={() => handlePlanSelection('yearly')}>
              योजना चुनें
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
