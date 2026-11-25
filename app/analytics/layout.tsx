// app/analytics/layout.tsx
import React from "react";
import DashboardHeader from "@/components/ui/custom/header";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FFFFFF] p-3">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content with Header */}
      <main className="flex flex-1 flex-col">
        <header className="bg-white">
          <DashboardHeader />
        </header>
        <div className="overflow-auto p-4">{children}</div>
      </main>
    </div>
  );
}
