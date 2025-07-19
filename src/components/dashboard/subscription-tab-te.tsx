
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import type { UserData } from "@/app/te/dashboard/page";
import { format } from "date-fns";
import { te } from "date-fns/locale";

interface SubscriptionTabProps {
    user: UserData;
}

export function SubscriptionTab({ user }: SubscriptionTabProps) {
    if (!user.subscription) {
      return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" /> చందా స్థితి</CardTitle>
                <CardDescription>మీ ప్రస్తుత సభ్యత్వ ప్రణాళిక మరియు స్థితి.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>చందా సమాచారం కనుగొనబడలేదు.</p>
            </CardContent>
        </Card>
      )
    }
    
    const { plan, status, renewalDate } = user.subscription;
    const formattedRenewalDate = renewalDate ? format(renewalDate.toDate(), "MMMM d, yyyy", { locale: te }) : 'N/A';
    const isPlanActive = status === 'active';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" /> చందా స్థితి</CardTitle>
                <CardDescription>మీ ప్రస్తుత సభ్యత్వ ప్రణాళిక మరియు స్థితి.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                        <p className="font-semibold capitalize">ప్రస్తుత ప్రణాళిక: {plan === 'yearly' ? 'వార్షిక' : 'నెలవారీ'}</p>
                        <p className="text-sm text-muted-foreground">
                            {isPlanActive ? `నవీకరణ తేదీ: ${formattedRenewalDate}` : `గడువు ముగిసిన తేదీ: ${formattedRenewalDate}`}
                        </p>
                    </div>
                    <Badge variant="default" className={isPlanActive ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                        {status === 'active' ? 'క్రియాశీలం' : 'క్రియారహితం'}
                    </Badge>
                </div>
                <Button>చందాను నిర్వహించండి</Button>
            </CardContent>
        </Card>
    );
}
