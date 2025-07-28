
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentButton } from "@/components/payment-button";

export default function SubscribePage() {
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
