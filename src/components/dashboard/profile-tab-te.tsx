
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import type { UserData } from "@/app/te/dashboard/page";
import { EditProfileDialogTe } from "./edit-profile-dialog-te";

interface ProfileTabProps {
    user: UserData;
    userId: string;
}

export function ProfileTab({ user, userId }: ProfileTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> వ్యక్తిగత సమాచారం</CardTitle>
                <CardDescription>మీ వ్యక్తిగత వివరాలను వీక్షించండి మరియు నిర్వహించండి.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold text-muted-foreground">మొదటి పేరు:</span> {user.firstName}</div>
                    <div><span className="font-semibold text-muted-foreground">ఇంటి పేరు:</span> {user.lastName}</div>
                    <div><span className="font-semibold text-muted-foreground">ఇమెయిల్:</span> {user.email}</div>
                    <div><span className="font-semibold text-muted-foreground">ఫోన్:</span> {user.phone}</div>
                    <div><span className="font-semibold text-muted-foreground">చిరునామా:</span> {user.address}</div>
                </div>
                <EditProfileDialogTe user={user} userId={userId} />
            </CardContent>
        </Card>
    );
}
