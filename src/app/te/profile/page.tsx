
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { UnionIdCardTe } from "@/components/dashboard/union-id-card-te";

export default function ProfilePage() {
    const { userData, firebaseUser, loading } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        addressLine: '',
        city: '',
        state: '',
        pinCode: '',
    });

     useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || '',
                phone: userData.phone || '',
                email: userData.email || '',
                addressLine: userData.addressLine || '',
                city: userData.city || '',
                state: userData.state || '',
                pinCode: userData.pinCode || '',
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSave = async () => {
        if (!firebaseUser) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            await updateDoc(userDocRef, {
                ...formData,
            });
            toast({
                title: "ప్రొఫైల్ నవీకరించబడింది!",
                description: "మీ సమాచారం విజయవంతంగా సేవ్ చేయబడింది.",
            });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "నవీకరణ విఫలమైంది",
                description: "మీ ప్రొఫైల్‌ను సేవ్ చేయడం సాధ్యం కాలేదు. దయచేసి మీ కనెక్షన్‌ని తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }


    if (loading) {
        return (
             <div className="space-y-8">
                 <Skeleton className="h-64 w-full max-w-md mx-auto" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2 md:col-span-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2 md:col-span-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!firebaseUser || !userData) {
        return <p>వినియోగదారు డేటాను లోడ్ చేయడం సాధ్యం కాలేదు. దయచేసి మళ్లీ లాగిన్ చేయడానికి ప్రయత్నించండి.</p>
    }
    
    return (
        <div className="space-y-8">
            <div className="max-w-md mx-auto">
                <UnionIdCardTe />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><UserCircle className="text-primary" /> వ్యక్తిగత సమాచారం</CardTitle>
                    <CardDescription>మీ వ్యక్తిగత వివరాలను వీక్షించండి మరియు నిర్వహించండి. ఈ సమాచారం ప్రైవేట్‌గా ఉంచబడుతుంది.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="fullName">పూర్తి పేరు</Label>
                            <Input id="fullName" value={formData.fullName} onChange={handleChange} placeholder="మీ పూర్తి పేరు" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">ఫోన్</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="మీ 10-అంకెల ఫోన్ నంబర్" readOnly className="bg-gray-100 cursor-not-allowed"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">ఇమెయిల్ (ఐచ్ఛికం)</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="మీరు@ఉదాహరణ.com" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="addressLine">చిరునామా</Label>
                            <Input id="addressLine" value={formData.addressLine} onChange={handleChange} placeholder="వీధి, అపార్ట్‌మెంట్, మొదలైనవి." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">నగరం</Label>
                            <Input id="city" value={formData.city} onChange={handleChange} placeholder="ఉదా. హైదరాబాద్" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">రాష్ట్రం</Label>
                            <Input id="state" value={formData.state} onChange={handleChange} placeholder="ఉదా. తెలంగాణ" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pinCode">పిన్ కోడ్</Label>
                            <Input id="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="ఉదా. 500001" />
                        </div>
                   </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'సేవ్ చేస్తోంది...' : 'మార్పులను సేవ్ చేయండి'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
