"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Plus, Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { useTheme } from "@/components/ui/custom/ThemeProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";

import StatCard from "@/components/ui/custom/stat-card";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";
import GraphAnalysis from "@/components/ui/custom/analytics/GraphAnalysis";
import Reminders, {
  Reminder,
} from "@/components/ui/custom/reminders/Reminders";
// import TaskCard from "@/components/ui/custom/tasks/TasksCard";
import TimeTracker from "@/components/ui/custom/Time Tracker/TimeTracker";
import TeamCollaboration from "@/components/ui/custom/team collab/TeamCollaboration";
// import ProjectProgress from "@/components/ui/custom/Project Progress/ProjectProgress";
import TaskFormModal from "@/components/ui/custom/Modal/TasksModal";
import TaskPriority from "@/components/ui/custom/TaskPriority/TaskPriority";

interface DashboardData {
  taskCounts: {
    total: number;
    completed: number;
    ongoing: number;
    overdue: number;
  };
  analytics: {
    byPriority: { low: number; medium: number; high: number };
    byStatusOverTime: { data: string; completed: number; ongoing: number }[];
  };
  graphData: {
    data: {
      day: string;
      completed: number;
      uncompleted: number;
    }[];
  };
  reminders: {
    id: string;
    title: string;
    body: string | null;
    reminderDate: string;
    createdAt: string;
  }[];
  teamMembers: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
  }[];
  activeTasks: {
    id: string;
    title: string;
    completed: boolean;
    priority: "no_priority" | "low" | "medium" | "high";
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
}

const TodoDashboard = () => {
  const { data: session, status } = useSession();
  const { selectedWorkspace } = useWorkspace();
  const { textSecondary } = useTheme();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [, setReminderData] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/signin");
      return;
    }
    if (!session.user.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedWorkspace) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/dashboard?workspaceId=${selectedWorkspace}`,
        );
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedWorkspace]);

  useEffect(() => {
    if (dashboardData?.reminders) {
      setReminderData(dashboardData.reminders);
    }
  }, [dashboardData]);

  const markAsCompleted = async (id: string) => {
    await fetch(`/api/reminders?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDashboardData((prev) =>
      prev
        ? {
            ...prev,
            reminders: prev.reminders.filter((rem: Reminder) => rem.id !== id),
          }
        : null,
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div
        className={`flex h-screen flex-col items-center justify-center gap-3 ${textSecondary}`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div
        className={`flex h-screen items-center justify-center ${textSecondary}`}
      >
        No data available
      </div>
    );
  }

  const { taskCounts } = dashboardData;

  return (
    <div className="flex min-h-screen bg-[#FFFFFF] p-3">
      {/* Main Content */}
      <div>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <DashboardHeader />

        {/* Dashboard Content */}
        <div className="flex-1 space-y-6 rounded-2xl bg-[#f7f7f7] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl text-gray-900">Dashboard</h1>
              <p className="text-lg text-gray-400">
                Plan, prioritize, and accomplish your tasks with ease.
              </p>
            </div>
            <div className="flex gap-6">
              <motion.button
                onClick={() => setTaskModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open create task modal"
                className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-white shadow-sm shadow-emerald-500/25 transition hover:from-emerald-700 hover:to-emerald-600"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </motion.button>
              <TaskFormModal
                isOpen={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
              />
              <button className="rounded-full border border-emerald-600 px-4 py-2 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-sm">
                Import Data
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tasks"
              count={taskCounts.total}
              description="Increased from last month"
              variant="success"
            />

            <StatCard
              title="Ended Tasks"
              count={taskCounts.completed}
              description="Increased from last month"
              variant="neutral"
            />

            <StatCard
              title="Running Tasks"
              count={taskCounts.ongoing}
              description="Increased from last month"
              variant="neutral"
            />

            <StatCard
              title="Overdue Tasks"
              count={taskCounts.overdue}
              description="On Process"
              variant="neutral"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* Project Analytics */}
            <GraphAnalysis data={dashboardData.graphData.data} />
            <TeamCollaboration members={dashboardData.teamMembers} />
            {/* <TaskCard /> */}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Team Collaboration */}

            <Reminders
              Reminder={dashboardData.reminders}
              onComplete={markAsCompleted}
            />
            <TaskPriority Tasks={dashboardData.activeTasks} />
            {/* Time Tracker */}
            <TimeTracker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;
