
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserCircle, CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { te } from "date-fns/locale";
import { cn } from "@/lib/utils";


export default function ProfilePage() {
    const { userData, firebaseUser, loading } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        email: '',
    });
    const [dob, setDob] = useState<Date | undefined>(undefined);

     useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                address: userData.address || '',
                email: userData.email || '',
            });
             if (userData.dob) {
                try {
                    const parsedDate = parse(userData.dob, 'yyyy-MM-dd', new Date());
                    if (!isNaN(parsedDate.getTime())) {
                       setDob(parsedDate);
                    } else {
                       console.warn("Invalid date format for DOB:", userData.dob);
                       setDob(undefined);
                    }
                } catch (e) {
                    console.warn("Error parsing DOB:", userData.dob, e);
                    setDob(undefined);
                }
            } else {
                setDob(undefined);
            }
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
                dob: dob ? format(dob, 'yyyy-MM-dd') : null,
            });
            toast({
                title: "ప్రొఫైల్ నవీకరించబడింది",
                description: "మీ సమాచారం విజయవంతంగా నవీకరించబడింది.",
            });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "లోపం",
                description: "మీ ప్రొఫైల్‌ను నవీకరించడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }


    if (loading) {
        return (
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2 md:col-span-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> వ్యక్తిగత సమాచారం</CardTitle>
                    <CardDescription>మీ వ్యక్తిగత వివరాలను వీక్షించండి మరియు నిర్వహించండి.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">మొదటి పేరు</Label>
                            <Input id="firstName" value={formData.firstName} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="lastName">ఇంటి పేరు</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">ఫోన్</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">ఇమెయిల్</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="మీరు@ఉదాహరణ.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">పుట్టిన తేది</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !dob && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dob ? format(dob, "PPP", { locale: te }) : <span>తేదీని ఎంచుకోండి</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={dob}
                                    onSelect={setDob}
                                    initialFocus
                                    locale={te}
                                    captionLayout="dropdown-buttons"
                                    fromYear={1950}
                                    toYear={new Date().getFullYear() - 18}
                                  />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">చిరునామా</Label>
                            <Input id="address" value={formData.address} onChange={handleChange} placeholder="123 మెయిన్ సెయింట్, ఎనీటౌన్, రాష్ట్రం, 12345" />
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
