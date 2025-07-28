
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentButton } from "@/components/payment-button";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { Skeleton } from "@/components/ui/skeleton";

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

  // If user has an active subscription, show the status card instead of payment options
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
  
  return (
    <div className="flex flex-col items-center justify-center w-full space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">మీ సభ్యత్వ ప్రణాళికను ఎంచుకోండి</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          మీకు సరిపోయే ప్రణాళికను ఎంచుకుని, తెలంగాణ ఆల్ బిల్డింగ్ వర్కర్స్ యూనియన్‌లో అధికారిక సభ్యులు అవ్వండి. మీ యూనియన్ ఐడిని పొందండి మరియు అన్ని సభ్యుల ప్రయోజనాలను తక్షణమే అన్‌లాక్ చేయండి.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>నెలవారీ ప్రణాళిక</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹100</p>
            <p className="text-muted-foreground">నెలకు</p>
          </CardContent>
          <CardFooter>
            <PaymentButton
              plan="monthly"
              amount={100}
              buttonText="నమోదు చేసుకోండి"
            />
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>వార్షిక ప్రణాళిక</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹1,200</p>
            <p className="text-muted-foreground">సంవత్సరానికి</p>
          </CardContent>
          <CardFooter>
             <PaymentButton
              plan="yearly"
              amount={1200}
              buttonText="నమోదు చేసుకోండి"
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
