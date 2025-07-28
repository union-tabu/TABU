
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { te } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Star, Calendar, ShieldCheck, Clock } from 'lucide-react';

const planMap: { [key: string]: string } = {
    'monthly': 'Monthly',
    'yearly': 'Yearly'
};
const planMapTe: { [key: string]: string } = {
    'monthly': 'నెలవారీ',
    'yearly': 'వార్షిక'
};

const statusMap: { [key: string]: string } = {
    'active': 'Active',
    'inactive': 'Inactive',
    'cancelled': 'Cancelled'
};
const statusMapTe: { [key: string]: string } = {
    'active': 'క్రియాశీలం',
    'inactive': 'నిష్క్రియం',
    'cancelled': 'రద్దు చేయబడింది'
};

export function SubscriptionStatusCard({ isTelugu = false }: { isTelugu?: boolean }) {
    const { userData, loading } = useAuth();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!userData?.subscription) {
        const subscribeLink = isTelugu ? '/te/dashboard/subscribe' : '/dashboard/subscribe';
        const titleText = isTelugu ? "సభ్యత్వం లేదు" : "No Subscription Found";
        const descriptionText = isTelugu ? "ప్రయోజనాలను అన్‌లాక్ చేయడానికి సభ్యత్వాన్ని పొందండి." : "Get a subscription to unlock benefits.";
        const buttonText = isTelugu ? "ఇప్పుడే సభ్యత్వాన్ని పొందండి" : "Subscribe Now";

        return (
            <Card className="text-center">
                 <CardHeader>
                    <CardTitle>{titleText}</CardTitle>
                    <CardDescription>{descriptionText}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href={subscribeLink}>{buttonText}</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const { plan, status, renewalDate: renewalDateData } = userData.subscription;
    
    const renewalDate = renewalDateData?.seconds
        ? format(new Date(renewalDateData.seconds * 1000), "MMMM dd, yyyy", { locale: isTelugu ? te : undefined })
        : "N/A";
    
    const currentPlan = isTelugu ? (planMapTe[plan] || plan) : (planMap[plan] || plan);
    const currentStatus = isTelugu ? (statusMapTe[status] || status) : (statusMap[status] || status);

    const titleText = isTelugu ? "మీ సభ్యత్వ వివరాలు" : "Your Subscription Details";
    const descriptionText = isTelugu ? "మీ ప్రస్తుత ప్లాన్ మరియు స్థితిని వీక్షించండి." : "View your current plan and status.";
    const planLabel = isTelugu ? "ప్లాన్" : "Plan";
    const statusLabel = isTelugu ? "స్థితి" : "Status";
    const renewalLabel = isTelugu ? "తదుపరి పునరుద్ధరణ" : "Next Renewal";
    
    const statusBadgeVariant = status === 'active' ? 'default' : 'destructive';
    const statusBadgeClass = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star className="text-primary" /> {titleText}</CardTitle>
                <CardDescription>{descriptionText}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                         <ShieldCheck className="h-8 w-8 text-primary" />
                        <div>
                            <span className="font-semibold text-muted-foreground">{planLabel}</span>
                            <p className="text-lg font-bold capitalize">{currentPlan}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                         <Clock className="h-8 w-8 text-primary" />
                        <div>
                            <span className="font-semibold text-muted-foreground">{statusLabel}</span>
                             <div className="text-lg font-bold">
                                <Badge variant={statusBadgeVariant} className={statusBadgeClass}>
                                    {currentStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <Calendar className="h-8 w-8 text-primary" />
                        <div>
                            <span className="font-semibold text-muted-foreground">{renewalLabel}</span>
                            <p className="text-lg font-bold">{renewalDate}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
