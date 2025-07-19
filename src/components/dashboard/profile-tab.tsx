
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import type { UserData } from "@/app/dashboard/page";
import { EditProfileDialog } from "./edit-profile-dialog";

interface ProfileTabProps {
    user: UserData;
    userId: string;
}

export function ProfileTab({ user, userId }: ProfileTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> Personal Information</CardTitle>
                <CardDescription>View and manage your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold text-muted-foreground">First Name:</span> {user.firstName}</div>
                    <div><span className="font-semibold text-muted-foreground">Last Name:</span> {user.lastName}</div>
                    <div><span className="font-semibold text-muted-foreground">Email:</span> {user.email}</div>
                    <div><span className="font-semibold text-muted-foreground">Phone:</span> {user.phone}</div>
                    <div><span className="font-semibold text-muted-foreground">Address:</span> {user.address}</div>
                </div>
                <EditProfileDialog user={user} userId={userId} />
            </CardContent>
        </Card>
    );
}
