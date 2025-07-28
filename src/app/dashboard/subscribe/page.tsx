
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentButton } from "@/components/payment-button";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscribePage() {
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
                <h1 className="text-3xl font-bold tracking-tight">You are already subscribed!</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    You can manage your subscription from your profile. New payment options will be available here once your current plan expires.
                </p>
            </div>
            <SubscriptionStatusCard />
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Membership Plan</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
          Select a plan that suits you best and become an official member of the Telangana All Building
          Workers Union. Get your Union ID and unlock all member benefits instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Monthly Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹100</p>
            <p className="text-muted-foreground">per month</p>
          </CardContent>
          <CardFooter>
            <PaymentButton
              plan="monthly"
              amount={100}
              buttonText="Register"
            />
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Annual Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-4xl font-bold">₹1,200</p>
            <p className="text-muted-foreground">per year</p>
          </CardContent>
          <CardFooter>
             <PaymentButton
              plan="yearly"
              amount={1200}
              buttonText="Register"
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
