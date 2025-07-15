"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  FolderOpen,
} from "lucide-react";
import StatCard from "@/components/ui/custom/stat-card";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

const TodoDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(5048); // 01:24:08
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

  const [teamMembers] = useState([
    {
      id: 1,
      name: "Alexandra Deff",
      role: "Working on GitHub Project Repository",
      status: "Completed",
      avatar: "👩‍💻",
    },
    {
      id: 2,
      name: "Edwin Adenike",
      role: "Working on Integrate User Authentication System",
      status: "In Progress",
      avatar: "👨‍💼",
    },
    {
      id: 3,
      name: "Isaac Oluwatemilorun",
      role: "Working on Develop Order Filter Functionality",
      status: "Pending",
      avatar: "👨‍🎨",
    },
    {
      id: 4,
      name: "David Oshodi",
      role: "Working on Responsive Layout for Homepage",
      status: "In Progress",
      avatar: "👨‍💻",
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isTimerRunning) {
        setTimerSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const formatTime = (seconds: any) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTask = (id: any) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityColor = (priority: any) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-orange-600 bg-orange-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50";
      case "In Progress":
        return "text-blue-600 bg-blue-50";
      case "Pending":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

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
              <button className="border border-green-700 text-green-700 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                Import Data
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 space-x-4">
            <StatCard
              title="Total Projects"
              count={24}
              description="Increased from last month"
              isColored={true}
            />

            <StatCard
              title="Ended Projects"
              count={10}
              description="Increased from last month"
              isColored={false}
            />

            <StatCard
              title="Running Projects"
              count={12}
              description="Increased from last month"
              isColored={false}
            />

            <StatCard
              title="Pending Project"
              count={2}
              description="On Process"
              isColored={false}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Analytics */}
            <div className="bg-white p-6 rounded-2xl ">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Analytics
              </h3>
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="w-8 h-16 bg-gray-300 rounded"></div>
                    <div className="w-8 h-24 bg-emerald-300 rounded"></div>
                    <div className="w-8 h-20 bg-emerald-400 rounded"></div>
                    <div className="w-8 h-32 bg-emerald-600 rounded"></div>
                    <div className="w-8 h-16 bg-gray-300 rounded"></div>
                    <div className="w-8 h-12 bg-gray-300 rounded"></div>
                    <div className="w-8 h-20 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex justify-center space-x-4 text-xs text-gray-500">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reminders
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Meeting with Arc Company
                    </div>
                    <div className="text-sm text-gray-500">
                      Time: 10:00 pm - 04:00 pm
                    </div>
                  </div>
                </div>
                <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-colors">
                  <Play className="w-4 h-4" />
                  <span>Start Meeting</span>
                </button>
              </div>
            </div>

            {/* Project Progress */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Progress
              </h3>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="351.86"
                      strokeDashoffset={
                        351.86 - (351.86 * completionPercentage) / 100
                      }
                      className="text-emerald-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">Project Ended</div>
                <div className="flex justify-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full mr-1"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Collaboration */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
            </div>

            {/* Time Tracker */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-lg text-white">
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
            </div>
          </div>

          {/* Current Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Tasks
              </h3>
              <button className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <button
                    onClick={() => toggleTask(tasks)}
                    className="flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        task.completed
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <FolderOpen className="w-3 h-3" />
                      <span>{task.project}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;
