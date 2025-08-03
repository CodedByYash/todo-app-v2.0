"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";
import { motion } from "motion/react";

import StatCard from "@/components/ui/custom/stat-card";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";
import GraphAnalysis from "@/components/ui/custom/analytics/GraphAnalysis";
import Reminders from "@/components/ui/custom/reminders/Reminders";
// import TaskCard from "@/components/ui/custom/tasks/TasksCard";
import TimeTracker from "@/components/ui/custom/Time Tracker/TimeTracker";
// import TeamCollaboration from "@/components/ui/custom/team collab/TeamCollaboration";
import ProjectProgress from "@/components/ui/custom/Project Progress/ProjectProgress";

import { useTheme } from "@/components/ui/custom/ThemeProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import TaskFormModal from "@/components/ui/custom/Modal/TasksModal";

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
}

const TodoDashboard = () => {
  const { data: session, status } = useSession();
  const { selectedWorkspace } = useWorkspace();
  const { textSecondary } = useTheme();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  // const [teamMembers, setTeamMembers] = useState<
  //   { id: string; username: string; firstname: string; lastname: string }[]
  // >([]);
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
          console.log(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // const fetchMembers = async () => {
    //   if (!selectedWorkspace) return;
    //   try {
    //     const response = await fetch(
    //       `/api/workspaces/${selectedWorkspace}/members`,
    //     );
    //     if (response.ok) {
    //       const members = await response.json();
    //       setTeamMembers(members);
    //       console.log("successfully fetched member");
    //       console.log(members);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching team memebes:", error);
    //   }
    // };

    fetchDashboardData();
    // fetchMembers();
  }, [selectedWorkspace]);

  if (status === "loading" || isLoading) {
    return (
      <div
        className={`flex h-screen items-center justify-center ${textSecondary}`}
      >
        Loading...
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
    <div className="flex min-h-screen bg-[#FFFFFF]">
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
                className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-green-800 to-green-500 px-4 py-2 text-white transition hover:from-green-700 hover:to-green-400"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </motion.button>
              <TaskFormModal
                isOpen={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
              />
              <button className="rounded-full border border-green-700 px-4 py-2 text-green-700 transition-all hover:bg-gradient-to-r hover:from-green-800 hover:via-emerald-700 hover:to-green-500 hover:text-white">
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Project Analytics */}
            <GraphAnalysis data={dashboardData.graphData.data} />

            {/* Reminders */}
            <Reminders />

            {/* Project Progress */}
            <ProjectProgress />
            {/*<TaskCard />*/}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Team Collaboration */}
            {/*<TeamCollaboration members={members} />*/}

            {/* Time Tracker */}
            <TimeTracker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;
