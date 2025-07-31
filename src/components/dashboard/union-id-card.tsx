
"use client";

import * as React from "react";
import { useRef, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import { format } from 'date-fns';
import { BadgeCheck, UserCircle, Download, Loader2 } from "lucide-react";
import { toJpeg } from 'html-to-image';
import { useToast } from "@/hooks/use-toast";

export function UnionIdCard() {
    const { userData, loading } = useAuth();
    const idCardRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = React.useState(false);

    const onDownload = useCallback(() => {
        if (idCardRef.current === null) {
            return;
        }

        setIsDownloading(true);

        toJpeg(idCardRef.current, { 
                cacheBust: true, 
                quality: 0.95,
                backgroundColor: 'white',
                pixelRatio: 2, // Increase for better quality on high-res screens
                skipFonts: true // Skips embedding external fonts to avoid CORS issues
            })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `TABU-ID-Card-${userData?.unionId || 'member'}.jpg`;
                link.href = dataUrl;
                link.click();
                toast({
                    title: "ID Card Downloaded",
                    description: "Your ID card has been successfully saved.",
                });
            })
            .catch((err) => {
                console.error(err);
                toast({
                    title: "Download Failed",
                    description: "There was a problem downloading the ID card. Please try again.",
                    variant: "destructive"
                });
            })
            .finally(() => {
                setIsDownloading(false);
            });
    }, [idCardRef, userData, toast]);


    if (loading) {
        return <UnionIdCardSkeleton />;
    }

    if (!userData) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Union ID Card</CardTitle>
                    <CardDescription>User data could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    const { fullName, unionId, createdAt, subscription } = userData;
    const joinDate = createdAt?.seconds ? format(new Date(createdAt.seconds * 1000), "MMMM yyyy") : 'N/A';
    const isActiveMember = subscription?.status === 'active';

    return (
        <div className="w-full">
            <Card ref={idCardRef} className="w-full shadow-lg relative overflow-hidden bg-slate-50">
                {/* Watermark */}
                <Image 
                    src="/tabu-logo-website.png" 
                    alt="Watermark" 
                    width={200}
                    height={200}
                    className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none"
                />
                <CardHeader className="bg-primary text-primary-foreground p-4">
                    <div className="flex items-center gap-3">
                        <Image src="/tabu-logo-website.png" alt="TABU Logo" width={40} height={40} className="bg-white rounded-sm p-1"/>
                        <div>
                            <CardTitle className="text-xl">Telangana All Building Workers Union</CardTitle>
                            <CardDescription className="text-primary-foreground/80 text-xs">Official Member ID</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-3 gap-6 items-center">
                    <div className="col-span-1">
                        <div data-ai-hint="profile picture" className="w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-gray-200 flex items-center justify-center">
                            <UserCircle className="w-20 h-20 text-gray-400" />
                        </div>
                    </div>
                    <div className="col-span-2 space-y-3 relative">
                        {isActiveMember && (
                            <div className="absolute top-0 right-0 transform -rotate-12 opacity-80">
                            <div className="flex items-center gap-1 border-2 border-green-600 text-green-700 font-bold text-xs p-1 rounded-md bg-green-100">
                                <BadgeCheck className="h-4 w-4" />
                                VERIFIED
                            </div>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-muted-foreground font-semibold">FULL NAME</p>
                            <p className="text-lg font-bold text-foreground">{fullName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-semibold">UNION ID</p>
                            <p className="text-lg font-mono font-bold text-primary">{unionId || 'Pending...'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-semibold">MEMBER SINCE</p>
                            <p className="text-base font-bold text-foreground">{joinDate}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={onDownload} disabled={isDownloading} className="w-full mt-4">
                {isDownloading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-4 w-4" />
                        Download ID
                    </>
                )}
            </Button>
        </div>
    );
}

function UnionIdCardSkeleton() {
    return (
        <div className="space-y-2">
            <Card className="w-full shadow-lg">
                <CardHeader className="bg-muted p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-sm" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-64" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-3 gap-6 items-center">
                    <div className="col-span-1">
                        <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-md"/>
                    </div>
                    <div className="col-span-2 space-y-4">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-10 w-full" />
        </div>
    );
}
