"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Bell,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  Target,
  TrendingUp,
  User,
  FolderOpen,
  Smartphone,
} from "lucide-react";
import StatCard from "@/components/ui/custom/stat-card";

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
      <div className="w-64  shadow-sm flex flex-col p-1 bg-[#f7f7f7] rounded-2xl mr-6">
        <div className="flex items-center space-x-2 p-5 ">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Taskito</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-3">
            Menu
          </div>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-3" />
            Tasks
            <span className="ml-auto bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
              12
            </span>
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Calendar className="w-4 h-4 mr-3" />
            Calendar
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Analytics
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Users className="w-4 h-4 mr-3" />
            Team
          </a>

          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-3 mt-6">
            General
          </div>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <HelpCircle className="w-4 h-4 mr-3" />
            Help
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </a>
        </nav>

        {/* Mobile App Download Card */}
        <div className="m-4 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg text-white">
          <div className="flex items-center mb-2">
            <Smartphone className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Download our Mobile App</span>
          </div>
          <p className="text-xs text-emerald-100 mb-3">
            Get easy access anywhere you go
          </p>
          <button className="w-full bg-white text-emerald-600 text-sm font-medium py-2 px-4 rounded-lg hover:bg-emerald-50 transition-colors">
            Download
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="shadow-sm rounded-2xl px-6 py-5 bg-[#f7f7f7] mb-3">
          <div className="flex items-center justify-between">
            <div className="relative bg-[#FFFFFF] rounded-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search task"
                className="pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 bg-[#FFFFFF] rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">TM</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Totok Michael
                  </div>
                  <div className="text-xs text-gray-500">
                    tmichael20@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

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
            <div className="bg-gradient-to-br from-green-500 to-green-950 text-white p-4 rounded-2xl">
              <div className="flex flex-col items-start">
                <div>
                  <div className="text-emerald-100 text-lg flex  items-center justify-between  space-x-[45px]">
                    <h1>Total Projects</h1>
                    <button className="bg-[#ffffff] rounded-full p-1">
                      <ArrowUpRight className="w-5 h-5 text-slate-500 " />
                    </button>
                  </div>
                  <div className="text-5xl mt-2">24</div>
                  <div className="text-emerald-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Increased from last month
                  </div>
                </div>
              </div>
            </div>

            <StatCard
              title="Ended Projects"
              count={10}
              description="Increased from last month"
            />

            <StatCard
              title="Running Projects"
              count={12}
              description="Increased from last month"
            />

            <StatCard
              title="Pending Project"
              count={2}
              description="On Process"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Analytics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
