"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserCircle, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useState, useEffect, useRef } from "react";
import { UnionIdCardTe } from "@/components/dashboard/union-id-card-te";
import Image from "next/image";

export default function ProfilePageTe() {
    const { userData, firebaseUser, loading, refreshUserData } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        addressLine: '',
        city: '',
        state: '',
        pinCode: '',
        profession: '',
        referredBy: '',
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
                profession: userData.profession || '',
                referredBy: userData.referredBy || '',
            });
            setImagePreview(userData.photoURL || null);
        }
    }, [userData]);

     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ title: 'చిత్రం చాలా పెద్దది', description: 'దయచేసి 2MB కంటే చిన్న చిత్రాన్ని ఎంచుకోండి.', variant: 'destructive' });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSave = async () => {
        if (!firebaseUser) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            let photoURL = userData?.photoURL;

            if (imageFile && imagePreview) {
                const storageRef = ref(storage, `profileImages/${firebaseUser.uid}`);
                const uploadTask = await uploadString(storageRef, imagePreview, 'data_url');
                photoURL = await getDownloadURL(uploadTask.ref);
            }

            await updateDoc(userDocRef, {
                ...formData,
                photoURL: photoURL
            });
            await refreshUserData();
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
            setImageFile(null);
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
                    <div className="grid gap-2 items-center justify-center text-center">
                        <Label htmlFor="profileImage">ప్రొఫైల్ చిత్రం</Label>
                        <div 
                            className="relative mx-auto w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Profile" layout="fill" className="rounded-full object-cover"/>
                            ) : (
                                <UserCircle className="w-16 h-16 text-gray-400" />
                            )}
                             <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white"/>
                            </div>
                        </div>
                        <Input id="profileImage" type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} className="hidden" onChange={handleImageChange}/>
                        <p className="text-xs text-muted-foreground">చిత్రాన్ని మార్చడానికి క్లిక్ చేయండి (గరిష్టంగా 2MB)</p>
                    </div>

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
                         <div className="space-y-2">
                            <Label htmlFor="profession">వృత్తి</Label>
                            <Input id="profession" value={formData.profession} onChange={handleChange} placeholder="ఉదా. మేస్త్రీ, ఎలక్ట్రీషియన్" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="referredBy">సూచించిన వారు</Label>
                            <Input id="referredBy" value={formData.referredBy} onChange={handleChange} placeholder="సూచించిన వారి ఫోన్ (ఐచ్ఛికం)" />
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
