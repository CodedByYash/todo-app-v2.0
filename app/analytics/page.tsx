"use client";

import { useWorkspace } from "@/components/WorkspaceProvider";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  BarChart3,
  Clock,
  Target,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: "no_priority" | "low" | "medium" | "high";
  createdAt: string;
  dueDate: string | null;
};

const Analytics = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedWorkspace) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/tasks?workspaceId=${selectedWorkspace}`
        );
        if (res.ok) {
          const data = await res.json();
          setTasks(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedWorkspace]);

  // Stats
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priority breakdown
  const byPriority = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
    none: tasks.filter((t) => t.priority === "no_priority").length,
  };

  // Weekly completion data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("en", { weekday: "short" });
    const dayTasks = tasks.filter((t) => {
      const created = t.createdAt.split("T")[0];
      return created === dateStr;
    });
    return {
      day: dayLabel,
      date: dateStr,
      total: dayTasks.length,
      completed: dayTasks.filter((t) => t.completed).length,
    };
  });

  const maxWeekly = Math.max(...weeklyData.map((d) => d.total), 1);

  // Overdue
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
  ).length;

  const stats = [
    {
      title: "Total Tasks",
      value: total,
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active",
      value: active,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">
          Overview of your task productivity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                {stat.title}
              </span>
              <div className={`rounded-lg ${stat.bg} p-1.5`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 rounded-2xl border border-gray-100 bg-white p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Tasks Created (Last 7 Days)
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-200" />
                Total
              </span>
            </div>
          </div>
          <div className="flex h-48 items-end gap-3">
            {weeklyData.map((d, i) => (
              <div
                key={d.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div className="relative flex h-40 w-full items-end justify-center">
                  {/* Total bar (background) */}
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-lg bg-gray-100"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(d.total / maxWeekly) * 100}%`,
                    }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  />
                  {/* Completed bar (foreground) */}
                  <motion.div
                    className="relative z-10 w-full rounded-t-lg bg-emerald-500"
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(d.completed / maxWeekly) * 100}%`,
                    }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.4 }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-gray-100 bg-white p-6"
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-800">
            By Priority
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "High",
                count: byPriority.high,
                color: "bg-red-500",
                track: "bg-red-100",
              },
              {
                label: "Medium",
                count: byPriority.medium,
                color: "bg-amber-500",
                track: "bg-amber-100",
              },
              {
                label: "Low",
                count: byPriority.low,
                color: "bg-blue-500",
                track: "bg-blue-100",
              },
              {
                label: "None",
                count: byPriority.none,
                color: "bg-gray-400",
                track: "bg-gray-100",
              },
            ].map((item) => {
              const pct = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-800">
                      {item.count}
                    </span>
                  </div>
                  <div className={`h-2 w-full overflow-hidden rounded-full ${item.track}`}>
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overdue alert */}
          {overdue > 0 && (
            <div className="mt-6 rounded-xl bg-red-50 p-3 text-center">
              <span className="text-sm font-medium text-red-700">
                {overdue} overdue {overdue === 1 ? "task" : "tasks"}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Completion progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-gray-100 bg-white p-6"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Overall Progress
          </h3>
          <span className="text-sm font-medium text-emerald-600">
            {completed}/{total} tasks
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
