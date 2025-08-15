"use client";

import { useRef, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { hi } from 'date-fns/locale';
import { BadgeCheck, User, Calendar, Shield, Download, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { toJpeg } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";

const statusMap: { [key: string]: string } = {
    'active': 'सत्यापित सदस्य',
    'pending': 'लंबित',
    'inactive': 'निष्क्रिय',
};

export function UnionIdCardHi() {
    const { userData, loading } = useAuth();
    const idCardRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const onDownload = useCallback(() => {
        if (idCardRef.current === null) {
            return;
        }

        toJpeg(idCardRef.current, { 
            cacheBust: true, 
            quality: 0.95, 
            backgroundColor: 'white',
            skipFonts: true
        })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `TABU-ID-Card-${userData?.unionId || 'member'}.jpg`;
                link.href = dataUrl;
                link.click();
                 toast({
                    title: "आईडी कार्ड डाउनलोड किया गया",
                    description: "आपका आईडी कार्ड सफलतापूर्वक सहेजा गया है।",
                });
            })
            .catch((err) => {
                console.error(err);
                 toast({
                    title: "डाउनलोड विफल",
                    description: "आईडी कार्ड डाउनलोड करने में कोई समस्या हुई। कृपया पुनः प्रयास करें।",
                    variant: "destructive"
                });
            });
    }, [idCardRef, userData, toast]);


    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-[280px] w-full max-w-md mx-auto" />
                <Skeleton className="h-10 w-full max-w-md mx-auto" />
            </div>
        );
    }
    
    if (!userData) {
       return null;
    }
    
    const { fullName, unionId, createdAt, subscription, photoURL } = userData;
    const joinDate = createdAt?.seconds 
        ? format(new Date(createdAt.seconds * 1000), "MMMM yyyy", { locale: hi })
        : 'N/A';

    const status = subscription?.status || 'pending';
    const translatedStatus = statusMap[status] || status;

    return (
        <div className="w-full max-w-md mx-auto">
            <Card ref={idCardRef} className="shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 font-headline">
                <CardContent className="p-0">
                    <div className="p-5 bg-primary text-primary-foreground flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="h-10 w-auto bg-white rounded-full p-1" />
                            <div>
                                <h3 className="font-bold text-lg">तेलंगाना ऑल बिल्डिंग वर्कर्स यूनियन</h3>
                                <p className="text-xs opacity-90">आधिकारिक सदस्य आईडी</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                             <div className="w-28 h-28 rounded-md bg-gray-200 flex items-center justify-center relative overflow-hidden">
                                {photoURL ? (
                                    <Image src={photoURL} alt="Profile" layout="fill" className="object-cover" />
                                ) : (
                                    <UserCircle className="w-20 h-20 text-gray-400" />
                                )}
                            </div>

                            <div className="space-y-2 text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-gray-800">{fullName}</h2>
                                
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-sm text-muted-foreground">{unionId || 'आईडी लंबित'}</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">शामिल हुए: {joinDate}</span>
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
                        स्थिति: <span className="capitalize">{translatedStatus}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Button onClick={onDownload} className="w-full mt-4">
                <Download className="mr-2 h-4 w-4" />
                आईडी डाउनलोड करें
            </Button>
        </div>
    );
}
