
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { te } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShieldCheck, Clock, BadgeCheck } from 'lucide-react';

const planMapTe: { [key: string]: string } = {
    'monthly': 'నెలవారీ',
    'yearly': 'వార్షిక'
};

const statusMapTe: { [key: string]: string } = {
    'active': 'క్రియాశీలం',
    'inactive': 'నిష్క్రియం',
    'cancelled': 'రద్దు చేయబడింది',
    'pending': 'పెండింగ్‌లో ఉంది'
};

export function SubscriptionStatusCardTe() {
    const { userData, loading } = useAuth();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                        {[...Array(4)].map((_, i) => (
                             <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!userData) {
       return null;
    }

    const userStatus = userData.subscription?.status || 'pending';
    const { plan, status, renewalDate: renewalDateData } = userData.subscription || {};
    
    const renewalDate = renewalDateData?.seconds
        ? format(new Date(renewalDateData.seconds * 1000), "MMMM dd, yyyy", { locale: te })
        : "N/A";
    
    const currentPlan = plan ? (planMapTe[plan] || plan) : 'వర్తించదు';
    const currentStatus = status ? (statusMapTe[status] || status) : 'పెండింగ్‌లో ఉంది';

    const titleText = "మీ ఖాతా వివరాలు";
    const descriptionText = "మీ యూనియన్ ID, ప్రస్తుత ప్లాన్ మరియు స్థితిని వీక్షించండి.";
    const idLabel = "యూనియన్ ID";
    const planLabel = "ప్రస్తుత ప్లాన్";
    const statusLabel = "స్థితి";
    const renewalLabel = "తదుపరి చెల్లింపు";
    
    const statusBadgeVariant = userStatus === 'active' ? 'default' : 'destructive';
    const statusBadgeClass = userStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';

    return (
        <Card>
            <CardHeader>
                <CardTitle>{titleText}</CardTitle>
                <CardDescription>{descriptionText}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                         <BadgeCheck className="h-8 w-8 text-primary" />
                        <div>
                            <span className="font-semibold text-muted-foreground">{idLabel}</span>
                            <div className="text-lg font-bold font-mono">{userData.unionId || 'N/A'}</div>
                        </div>
                    </div>

                    {userStatus === 'active' ? (
                        <>
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
                        </>
                    ) : (
                         <div className="flex items-center gap-3 md:col-span-3">
                            <Clock className="h-8 w-8 text-amber-600" />
                            <div>
                                <span className="font-semibold text-muted-foreground">{statusLabel}</span>
                                <div className="text-lg font-bold">
                                    <Badge variant="destructive" className={statusBadgeClass}>
                                        {currentStatus}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
