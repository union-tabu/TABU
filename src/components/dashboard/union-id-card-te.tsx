
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { te } from 'date-fns/locale';
import { BadgeCheck, User, Calendar, Shield } from 'lucide-react';
import Image from 'next/image';

const statusMap: { [key: string]: string } = {
    'active': 'ధృవీకరించబడిన సభ్యులు',
    'pending': 'పెండింగ్‌లో ఉంది',
    'inactive': 'నిష్క్రియం',
};

export function UnionIdCardTe() {
    const { userData, loading } = useAuth();

    if (loading) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-12 w-12" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-md" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!userData) {
       return null;
    }
    
    const joinDate = userData.createdAt?.seconds 
        ? format(new Date(userData.createdAt.seconds * 1000), "MMMM yyyy", { locale: te })
        : 'N/A';

    const status = userData.subscription?.status || 'pending';
    const translatedStatus = statusMap[status] || status;

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 font-headline">
            <CardContent className="p-0">
                <div className="p-5 bg-primary text-primary-foreground flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto bg-white rounded-full p-1" />
                        <div>
                            <h3 className="font-bold text-lg">తెలంగాణ బిల్డింగ్ వర్కర్స్ యూనియన్</h3>
                            <p className="text-xs opacity-90">అధికారిక సభ్యుల ID</p>
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div data-ai-hint="profile picture" className="relative h-28 w-28 rounded-md bg-gray-200 flex items-center justify-center">
                             <User className="h-16 w-16 text-gray-400" />
                        </div>

                        <div className="space-y-2 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-800">{userData.fullName}</h2>
                            
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm text-muted-foreground">{userData.unionId || 'ID పెండింగ్‌లో ఉంది'}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">చేరినది: {joinDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                 {status === 'active' && (
                    <div className="bg-green-100 text-green-800 px-5 py-2 flex items-center justify-center gap-2 text-sm font-semibold">
                       <BadgeCheck className="h-5 w-5" />
                       {translatedStatus}
                    </div>
                 )}
                 {status !== 'active' && (
                    <div className="bg-amber-100 text-amber-800 px-5 py-2 flex items-center justify-center gap-2 text-sm font-semibold">
                       <Shield className="h-5 w-5" />
                       స్థితి: <span className="capitalize">{translatedStatus}</span>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
