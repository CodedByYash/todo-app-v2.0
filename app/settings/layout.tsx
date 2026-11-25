// app/settings/layout.tsx
import DashboardHeader from "@/components/ui/custom/header";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import React from "react";

export default function SettingsLayout({
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
