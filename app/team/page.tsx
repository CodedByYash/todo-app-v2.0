"use client";

import { Users, UserPlus, Mail } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

const TeamPage = () => {
  return (
    <div className="flex min-h-screen bg-white p-3">
      <div>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <div className="flex-1 space-y-6 rounded-2xl bg-[#f7f7f7] p-6">
          <div className="mb-2">
            <h1 className="text-3xl font-semibold text-gray-900">Team</h1>
            <p className="mt-1 text-gray-400">
              Manage your team members and collaboration settings.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Team collaboration coming soon
            </h2>
            <p className="mb-6 max-w-md text-sm text-gray-500">
              Invite team members, assign tasks, and collaborate in real-time.
              This feature is currently under development.
            </p>
            <div className="flex gap-3">
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </button>
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 opacity-50"
              >
                <Mail className="h-4 w-4" />
                Send Invite Link
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
