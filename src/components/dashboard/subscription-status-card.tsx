
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { te } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShieldCheck, Clock } from 'lucide-react';

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
    'cancelled': 'Cancelled',
    'pending': 'Pending'
};
const statusMapTe: { [key: string]: string } = {
    'active': 'క్రియాశీలం',
    'inactive': 'నిష్క్రియం',
    'cancelled': 'రద్దు చేయబడింది',
    'pending': 'పెండింగ్‌లో ఉంది'
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
    
    const userStatus = userData?.subscription?.status || 'pending';

    if (!userData || !userData.subscription || userStatus !== 'active') {
       return null;
    }

    const { plan, status, renewalDate: renewalDateData } = userData.subscription;
    
    const renewalDate = renewalDateData?.seconds
        ? format(new Date(renewalDateData.seconds * 1000), "MMMM dd, yyyy", { locale: isTelugu ? te : undefined })
        : "N/A";
    
    const currentPlan = plan ? (isTelugu ? (planMapTe[plan] || plan) : (planMap[plan] || plan)) : 'N/A';
    const currentStatus = isTelugu ? (statusMapTe[status] || status) : (statusMap[status] || status);

    const titleText = isTelugu ? "మీ ఖాతా వివరాలు" : "Your Account Details";
    const descriptionText = isTelugu ? "మీ ప్రస్తుత ప్లాన్ మరియు స్థితిని వీక్షించండి." : "View your current plan and status.";
    const planLabel = isTelugu ? "ప్రస్తుత ప్లాన్" : "Current Plan";
    const statusLabel = isTelugu ? "స్థితి" : "Status";
    const renewalLabel = isTelugu ? "తదుపరి చెల్లింపు" : "Next Payment";
    
    const statusBadgeVariant = status === 'active' ? 'default' : 'destructive';
    const statusBadgeClass = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    return (
        <Card>
            <CardHeader>
                <CardTitle>{titleText}</CardTitle>
                <CardDescription>{descriptionText}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                         <ShieldCheck className="h-8 w-8 text-primary" />
                        <div>
                            <span className="font-semibold text-muted-foreground">{planLabel}</span>
                            <div className="text-lg font-bold capitalize">{currentPlan}</div>
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
                            <div className="text-lg font-bold">{renewalDate}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
