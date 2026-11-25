"use client";

import { FolderKanban, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useWorkspace, Workspace } from "@/components/WorkspaceProvider";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

const WorkspacePage = () => {
  const { workspaces, selectedWorkspace, setSelectedWorkspace } = useWorkspace();

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
              <h1 className="text-3xl font-semibold text-gray-900">
                Workspaces
              </h1>
              <p className="mt-1 text-gray-400">
                Organize your projects into separate workspaces.
              </p>
            </div>
          </div>

          {workspaces.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <FolderKanban className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                No workspaces yet
              </h2>
              <p className="mb-6 max-w-md text-sm text-gray-500">
                Create your first workspace to start organizing tasks.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {workspaces.map((ws: Workspace, i: number) => (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedWorkspace(ws.id)}
                  className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    selectedWorkspace === ws.id
                      ? "border-emerald-400 ring-2 ring-emerald-500/20"
                      : "border-gray-200"
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedWorkspace === ws.id
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {ws.workspacename}
                      </h3>
                      {selectedWorkspace === ws.id && (
                        <span className="text-xs text-emerald-600">Active</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
