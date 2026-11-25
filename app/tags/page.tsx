"use client";

import { Tag, Plus } from "lucide-react";
import { motion } from "motion/react";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

const TagsPage = () => {
  return (
    <div className="flex min-h-screen bg-white p-3">
      <div>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <div className="flex-1 space-y-6 rounded-2xl bg-[#f7f7f7] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Tags</h1>
              <p className="mt-1 text-gray-400">
                Categorize and filter your tasks with custom tags.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <Tag className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Tags coming soon
            </h2>
            <p className="mb-6 max-w-md text-sm text-gray-500">
              Create custom tags to organize and filter tasks across your
              workspaces. This feature is currently being developed.
            </p>
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create Tag
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
