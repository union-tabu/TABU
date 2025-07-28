
"use client";

import { useAuth } from "@/context/auth-context";

export default function DashboardPageTe() {
  const { userData } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">డాష్‌బోర్డ్</h1>
      {userData && (
          <p className="text-lg text-muted-foreground mt-2">
             తిరిగి స్వాగతం, {userData.firstName}!
          </p>
      )}
    </div>
  );
}
