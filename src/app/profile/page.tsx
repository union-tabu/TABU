
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserCircle, Camera, Briefcase, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { useState, useEffect, useRef } from "react";
import { UnionIdCard } from "@/components/dashboard/union-id-card";
import Image from "next/image";

export default function ProfilePage() {
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
                toast({ title: 'Image Too Large', description: 'Please select an image smaller than 2MB.', variant: 'destructive' });
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

            // If a new image was selected, upload it
            if (imageFile && imagePreview) {
                const storageRef = ref(storage, `profileImages/${firebaseUser.uid}`);
                // Since imagePreview is a data URL (base64) from FileReader
                const uploadTask = await uploadString(storageRef, imagePreview, 'data_url');
                photoURL = await getDownloadURL(uploadTask.ref);
            }

            await updateDoc(userDocRef, {
                ...formData,
                photoURL: photoURL,
            });

            await refreshUserData(); // Refresh context data

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
            setImageFile(null); // Reset file state
        }
    }


    if (loading) {
        return (
             <div className="space-y-6">
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
        return <p>Could not load user data. Please try logging in again.</p>
    }
    
    return (
        <div className="space-y-8">
            <div className="max-w-md mx-auto">
              <UnionIdCard />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> Personal Information</CardTitle>
                    <CardDescription>View and manage your personal details. This information is kept private.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2 items-center justify-center text-center">
                        <Label htmlFor="profileImage">Profile Image</Label>
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
                        <p className="text-xs text-muted-foreground">Click to change image (Max 2MB)</p>
                    </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your first and last name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="Your 10-digit phone number" readOnly className="bg-gray-100 cursor-not-allowed"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profession">Profession</Label>
                            <Input id="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Mason, Electrician" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="referredBy">Referred by</Label>
                            <Input id="referredBy" value={formData.referredBy} onChange={handleChange} placeholder="Referrer's phone (optional)" />
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
