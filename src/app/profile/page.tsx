
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
                    // Ensure the date is parsed correctly without timezone issues
                    const [year, month, day] = userData.dob.split('-').map(Number);
                    setDob(new Date(year, month - 1, day));
                } catch (e) {
                    console.warn("Invalid date format for DOB:", userData.dob)
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                           <div className="space-y-2 md:col-span-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
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
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={formData.firstName} onChange={handleChange} placeholder="Your first name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Your last name" />
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
                            <Label htmlFor="address">Full Address</Label>
                            <Input id="address" value={formData.address} onChange={handleChange} placeholder="Street, City, State, PIN Code" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth (Optional)</Label>
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
                                    {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={dob}
                                    onSelect={setDob}
                                    initialFocus
                                    captionLayout="dropdown-buttons"
                                    fromYear={1950}
                                    toYear={new Date().getFullYear() - 18}
                                  />
                                </PopoverContent>
                            </Popover>
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
