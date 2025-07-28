"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Star } from "lucide-react";
import { EditProfileDialogTe } from "@/components/dashboard/edit-profile-dialog-te";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { te } from "date-fns/locale";


export default function ProfilePage() {
    const { userData, firebaseUser, loading } = useAuth();

    if (loading) {
        return (
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!firebaseUser || !userData) {
        return <p>వినియోగదారు డేటాను లోడ్ చేయడం సాధ్యం కాలేదు. దయచేసి మళ్లీ లాగిన్ చేయడానికి ప్రయత్నించండి.</p>
    }

    const renewalDate = userData.subscription?.renewalDate?.seconds 
        ? format(new Date(userData.subscription.renewalDate.seconds * 1000), "MMMM dd, yyyy", { locale: te })
        : "N/A";

    const planMap: { [key: string]: string } = {
        'monthly': 'నెలవారీ',
        'yearly': 'వార్షిక'
    };

    const statusMap: { [key: string]: string } = {
        'active': 'క్రియాశీలం',
        'inactive': 'నిష్క్రియం',
        'cancelled': 'రద్దు చేయబడింది'
    };
    
    const planInTelugu = userData.subscription?.plan ? planMap[userData.subscription.plan] : 'N/A';
    const statusInTelugu = userData.subscription?.status ? statusMap[userData.subscription.status] : 'N/A';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> వ్యక్తిగత సమాచారం</CardTitle>
                    <CardDescription>మీ వ్యక్తిగత వివరాలను వీక్షించండి మరియు నిర్వహించండి.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-semibold text-muted-foreground">మొదటి పేరు:</span> {userData.firstName}</div>
                        <div><span className="font-semibold text-muted-foreground">ఇంటి పేరు:</span> {userData.lastName}</div>
                        <div><span className="font-semibold text-muted-foreground">ఫోన్:</span> {userData.phone}</div>
                        <div className="md:col-span-2"><span className="font-semibold text-muted-foreground">చిరునామా:</span> {userData.address}</div>
                    </div>
                    <EditProfileDialogTe user={userData} userId={firebaseUser.uid} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Star className="text-primary" /> సభ్యత్వ వివరాలు</CardTitle>
                    <CardDescription>మీ సభ్యత్వ ప్రణాళిక మరియు స్థితిని నిర్వహించండి.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="font-semibold text-muted-foreground">ప్లాన్:</span> {planInTelugu}</div>
                        <div><span className="font-semibold text-muted-foreground">స్థితి:</span> {statusInTelugu}</div>
                        <div><span className="font-semibold text-muted-foreground">తదుపరి పునరుద్ధరణ:</span> {renewalDate}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
