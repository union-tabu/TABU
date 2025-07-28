"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardHeaderTe } from "@/components/layout/dashboard-header-te";
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTelugu = pathname ? pathname.startsWith('/te') : false;

  return (
    <div className="flex min-h-screen w-full flex-col">
      {isTelugu ? <DashboardHeaderTe /> : <DashboardHeader />}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
