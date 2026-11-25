// app/tasks/layout.tsx
import React from "react";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FFFFFF] p-3">
      <Sidebar />
      <main className="flex flex-1 flex-col">
        <header className="bg-white">
          <DashboardHeader />
        </header>
        <div className="flex-1 overflow-auto rounded-2xl bg-[#f7f7f7] p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
