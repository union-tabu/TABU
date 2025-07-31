
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserCircle, BadgeCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

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
                ...formData
            });
            toast({
                title: "Profile Updated!",
                description: "Your information has been successfully saved.",
            });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "Update Failed",
                description: "Could not save your profile. Please check your connection and try again.",
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
                        <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
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
        return <p>Could not load user data. Please try logging in again.</p>
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> Personal Information</CardTitle>
                    <CardDescription>View and manage your personal details. This information is kept private.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   {userData.unionId && (
                     <div className="space-y-2">
                        <Label htmlFor="unionId">Union ID</Label>
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5 text-green-600" />
                            <Input id="unionId" value={userData.unionId} readOnly className="font-mono bg-gray-100 cursor-not-allowed" />
                        </div>
                     </div>
                   )}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your first and last name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="Your 10-digit phone number" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="addressLine">Address</Label>
                            <Input id="addressLine" value={formData.addressLine} onChange={handleChange} placeholder="Street, Apartment, etc." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={formData.city} onChange={handleChange} placeholder="e.g. Hyderabad"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" value={formData.state} onChange={handleChange} placeholder="e.g. Telangana"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pinCode">PIN Code</Label>
                            <Input id="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="e.g. 500001"/>
                        </div>
                   </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
