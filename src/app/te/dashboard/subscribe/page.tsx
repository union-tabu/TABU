
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentButton } from "@/components/payment-button";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { differenceInMonths } from 'date-fns';

export default function SubscribePageTe() {
  const { userData, loading } = useAuth();

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
                <h1 className="text-3xl font-bold tracking-tight">మీరు ఇప్పటికే సభ్యత్వం పొందారు!</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    మీరు మీ ప్రొఫైల్ నుండి మీ సభ్యత్వాన్ని నిర్వహించవచ్చు. మీ ప్రస్తుత ప్రణాళిక గడువు ముగిసిన తర్వాత కొత్త చెల్లింపు ఎంపికలు ఇక్కడ అందుబాటులో ఉంటాయి.
                </p>
            </div>
            <SubscriptionStatusCard isTelugu={true} />
        </div>
    );
  }
  
  let isLapsed = false;
  const PENALTY_FEE = 500;
  const MONTHLY_PRICE = 100;
  const YEARLY_PRICE = 1200;

  if (userData) {
    const now = new Date();
    const status = userData.subscription?.status;
    
    if (status === 'not subscribed' && userData.createdAt) {
      const accountCreationDate = new Date(userData.createdAt.seconds * 1000);
      if (differenceInMonths(now, accountCreationDate) >= 2) {
        isLapsed = true;
      }
    } else if (status === 'inactive' && userData.subscription?.renewalDate) {
      const renewalDate = new Date(userData.subscription.renewalDate.seconds * 1000);
       if (differenceInMonths(now, renewalDate) >= 2) {
        isLapsed = true;
      }
    }
  }

  const monthlyAmount = isLapsed ? MONTHLY_PRICE + PENALTY_FEE : MONTHLY_PRICE;
  const yearlyAmount = isLapsed ? YEARLY_PRICE + PENALTY_FEE : YEARLY_PRICE;

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">మీ సభ్యత్వ ప్రణాళికను ఎంచుకోండి</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          మీకు సరిపోయే ప్రణాళికను ఎంచుకుని, తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్‌లో అధికారిక సభ్యులు అవ్వండి. మీ యూనియన్ ఐడిని పొందండి మరియు అన్ని సభ్యుల ప్రయోజనాలను తక్షణమే అన్‌లాక్ చేయండి.
        </p>
      </div>

       {isLapsed && (
          <Alert variant="destructive" className="max-w-4xl w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>పునఃప్రారంభ రుసుము వర్తింపజేయబడింది</AlertTitle>
            <AlertDescription>
              మీ ఖాతా రెండు నెలలకు పైగా నిష్క్రియంగా ఉంది. మీ సభ్యత్వాన్ని పునఃప్రారంభించడానికి ₹{PENALTY_FEE} ఒక-పర్యాయ రుసుము జోడించబడింది.
            </AlertDescription>
          </Alert>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>నెలవారీ ప్రణాళిక</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹{monthlyAmount}</p>
            <p className="text-muted-foreground">నెలకు</p>
            {isLapsed && <p className="text-sm text-muted-foreground">(₹{MONTHLY_PRICE} ప్లాన్ + ₹{PENALTY_FEE} రుసుము)</p>}
          </CardContent>
          <CardFooter>
            <PaymentButton
              plan="monthly"
              amount={monthlyAmount}
              buttonText="నమోదు చేసుకోండి"
            />
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>వార్షిక ప్రణాళిక</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹{yearlyAmount}</p>
            <p className="text-muted-foreground">సంవత్సరానికి</p>
            {isLapsed && <p className="text-sm text-muted-foreground">(₹{YEARLY_PRICE} ప్లాన్ + ₹{PENALTY_FEE} రుసుము)</p>}
          </CardContent>
          <CardFooter>
             <PaymentButton
              plan="yearly"
              amount={yearlyAmount}
              buttonText="నమోదు చేసుకోండి"
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
