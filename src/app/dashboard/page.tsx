
"use client";

import { useAuth } from "@/context/auth-context";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";

export default function DashboardPage() {
  const { userData } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {userData && (
            <p className="text-lg text-muted-foreground mt-2">
              Welcome back, {userData.firstName}!
            </p>
        )}
      </div>
      <SubscriptionStatusCard />
    </div>
  );
}
