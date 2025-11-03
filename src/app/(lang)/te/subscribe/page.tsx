
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function SubscribePageTe() {
  const { userData, loading } = useAuth();
  const router = useRouter();

  const handlePlanSelection = (plan: 'monthly' | 'yearly') => {
    router.push(`/te/order-summary?plan=${plan}`);
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
                <h1 className="text-3xl font-bold tracking-tight">మీరు ఇప్పటికే సభ్యత్వం పొందారు!</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    మీరు మీ ప్రొఫైల్ నుండి మీ సభ్యత్వాన్ని నిర్వహించవచ్చు. మీ ప్రస్తుత ప్రణాళిక గడువు ముగిసిన తర్వాత కొత్త చెల్లింపు ఎంపికలు ఇక్కడ అందుబాటులో ఉంటాయి.
                </p>
            </div>
            <SubscriptionStatusCard isTelugu={true} />
        </div>
    );
  }
  
  const MONTHLY_PRICE = 100;
  const YEARLY_PRICE = 1200;

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
            <p className="text-4xl font-bold">₹{MONTHLY_PRICE}</p>
            <p className="text-muted-foreground">నెలకు</p>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={() => handlePlanSelection('monthly')}>
              ప్రణాళికను ఎంచుకోండి
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>వార్షిక ప్రణాళిక</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹{YEARLY_PRICE}</p>
            <p className="text-muted-foreground">సంవత్సరానికి</p>
          </CardContent>
          <CardFooter>
             <Button size="lg" className="w-full" onClick={() => handlePlanSelection('yearly')}>
              ప్రణాళికను ఎంచుకోండి
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
