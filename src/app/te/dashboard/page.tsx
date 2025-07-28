
"use client";

import { useAuth } from "@/context/auth-context";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";

export default function DashboardPageTe() {
  const { userData } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">డాష్‌బోర్డ్</h1>
        {userData && (
            <p className="text-lg text-muted-foreground mt-2">
               తిరిగి స్వాగతం, {userData.firstName}!
            </p>
        )}
      </div>
       <SubscriptionStatusCard isTelugu={true} />
    </div>
  );
}
