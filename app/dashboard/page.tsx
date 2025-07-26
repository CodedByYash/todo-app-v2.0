"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import StatCard from "@/components/ui/custom/stat-card";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";
import GraphAnalysis from "@/components/ui/custom/analytics/GraphAnalysis";
import Reminders from "@/components/ui/custom/reminders/Reminders";
// import ProjectProgress from "@/components/ui/custom/Project Progress/ProjectProgress";
import TaskCard from "@/components/ui/custom/tasks/TasksCard";
import TimeTracker from "@/components/ui/custom/Time Tracker/TimeTracker";
import TeamCollaboration from "@/components/ui/custom/team collab/TeamCollaboration";

const TodoDashboard = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Develop API Endpoints",
      completed: false,
      priority: "high",
      project: "Backend Development",
      dueDate: "Nov 28, 2024",
    },
    {
      id: 2,
      title: "Onboarding Flow Design",
      completed: false,
      priority: "medium",
      project: "UX Design",
      dueDate: "Nov 29, 2024",
    },
    {
      id: 3,
      title: "Build Dashboard Components",
      completed: false,
      priority: "high",
      project: "Frontend Development",
      dueDate: "Nov 30, 2024",
    },
    {
      id: 4,
      title: "Optimize Page Load Speed",
      completed: false,
      priority: "medium",
      project: "Performance",
      dueDate: "Dec 1, 2024",
    },
    {
      id: 5,
      title: "Cross-Browser Testing",
      completed: false,
      priority: "low",
      project: "QA Testing",
      dueDate: "Dec 4, 2024",
    },
  ]);

  const members = [
    {
      id: 1,
      name: "Alexandra Deff",
      initials: "AD",
      status: "Completed",
      currentTask: "GitHub Project Repository",
      completionPercentage: 75,
    },
    {
      id: 1,
      name: "Alexandra Deff",
      initials: "AD",
      status: "Completed",
      currentTask: "GitHub Project Repository",
      completionPercentage: 75,
    },
    {
      id: 1,
      name: "Alexandra Deff",
      initials: "AD",
      status: "Completed",
      currentTask: "GitHub Project Repository",
      completionPercentage: 75,
    },
    // Add more members
  ];

  const weeklyData = [
    { day: "Mon", completed: 4, uncompleted: 1 },
    { day: "Tue", completed: 2, uncompleted: 3 },
    { day: "Wed", completed: 5, uncompleted: 5 },
    { day: "Thu", completed: 3, uncompleted: 2 },
    { day: "Fri", completed: 5, uncompleted: 0 },
    { day: "Sat", completed: 1, uncompleted: 4 },
    { day: "Sun", completed: 6, uncompleted: 2 }, // this should show a striped gray bar
  ];

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex p-5">
      {/* Sidebar */}
      <div>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 bg-[#f7f7f7] rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl text-gray-900 mb-2">Dashboard</h1>
              <p className="text-lg text-gray-400">
                Plan, prioritize, and accomplish your tasks with ease.
              </p>
            </div>
            <div className="flex gap-6">
              <button className="bg-gradient-to-r from-green-800 to-green-500 hover:from-green-700 hover:to-green-400 transition text-white px-4 py-2 flex items-center space-x-2  rounded-full">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
              <button className="border border-green-700 text-green-700 px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-green-800 hover:via-emerald-700 hover:to-green-500 hover:text-white transition-all">
                Import Data
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Tasks"
              count={24}
              description="Increased from last month"
              variant="success"
            />

            <StatCard
              title="Ended Tasks"
              count={10}
              description="Increased from last month"
              variant="neutral"
            />

            <StatCard
              title="Running Tasks"
              count={12}
              description="Increased from last month"
              variant="neutral"
            />

            <StatCard
              title="Overdue Tasks"
              count={2}
              description="On Process"
              variant="neutral"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Analytics */}
            <GraphAnalysis data={weeklyData} />

            {/* Reminders */}
            <Reminders />

            {/* Project Progress */}
            {/* <ProjectProgress
              completedPercentage={41}
              inProgressPercentage={20}
              pendingPercentage={39}
            /> */}
            {/*<TaskCard />*/}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Collaboration */}
            {/*<TeamCollaboration members={members} />*/}
            {/* <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Team Collaboration
                </h3>
                <button className="text-sm text-emerald-600 hover:text-emerald-700">
                  Add Member
                </button>
              </div>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        member.status
                      )}`}
                    >
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Time Tracker */}
            <TimeTracker />
            {/* <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Time Tracker</h3>
                <MoreHorizontal className="w-5 h-5" />
              </div>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold mb-2">
                  {formatTime(timerSeconds)}
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                >
                  {isTimerRunning ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                >
                  <Square className="w-6 h-6" />
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;
