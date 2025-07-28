"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Star } from "lucide-react";
import { EditProfileDialog } from "@/components/dashboard/edit-profile-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ProfilePage() {
    const { userData, firebaseUser, loading } = useAuth();

    if (loading) {
        return (
             <div className="space-y-4">
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
                    <CardContent className="space-y-4">
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

    if (!userData || !firebaseUser) {
        return <p>Could not load user data. Please try logging in again.</p>
    }
    
    const renewalDate = userData.subscription?.renewalDate?.seconds 
        ? format(new Date(userData.subscription.renewalDate.seconds * 1000), "MMMM dd, yyyy")
        : "N/A";

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> Personal Information</CardTitle>
                    <CardDescription>View and manage your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-semibold text-muted-foreground">First Name:</span> {userData.firstName}</div>
                        <div><span className="font-semibold text-muted-foreground">Last Name:</span> {userData.lastName}</div>
                        <div><span className="font-semibold text-muted-foreground">Phone:</span> {userData.phone}</div>
                        <div className="md:col-span-2"><span className="font-semibold text-muted-foreground">Address:</span> {userData.address}</div>
                    </div>
                    <EditProfileDialog user={userData} userId={firebaseUser.uid} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Star className="text-primary" /> Subscription Details</CardTitle>
                    <CardDescription>Manage your membership plan and status.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="font-semibold text-muted-foreground">Plan:</span> <span className="capitalize">{userData.subscription?.plan || 'N/A'}</span></div>
                        <div><span className="font-semibold text-muted-foreground">Status:</span> <span className="capitalize">{userData.subscription?.status || 'N/A'}</span></div>
                        <div><span className="font-semibold text-muted-foreground">Next Renewal:</span> {renewalDate}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
