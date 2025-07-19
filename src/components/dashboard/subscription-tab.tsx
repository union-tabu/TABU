
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import type { UserData } from "@/app/dashboard/page";
import { format } from "date-fns";

interface SubscriptionTabProps {
    user: UserData;
}

export function SubscriptionTab({ user }: SubscriptionTabProps) {
    const { plan, status, renewalDate } = user.subscription;
    const formattedRenewalDate = renewalDate ? format(renewalDate.toDate(), "MMMM d, yyyy") : 'N/A';
    const isPlanActive = status === 'active';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" /> Subscription Status</CardTitle>
                <CardDescription>Your current membership plan and status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                        <p className="font-semibold capitalize">Current Plan: {plan}</p>
                        <p className="text-sm text-muted-foreground">
                            {isPlanActive ? `Renews on: ${formattedRenewalDate}` : `Expired on: ${formattedRenewalDate}`}
                        </p>
                    </div>
                    <Badge variant="default" className={isPlanActive ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                        {status}
                    </Badge>
                </div>
                <Button>Manage Subscription</Button>
            </CardContent>
        </Card>
    );
}
