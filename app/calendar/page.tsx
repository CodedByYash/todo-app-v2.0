"use client";

import { useWorkspace } from "@/components/WorkspaceProvider";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: "no_priority" | "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
};

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
  no_priority: "bg-gray-400",
};

const Calendar = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const { selectedWorkspace } = useWorkspace();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedWorkspace) {
        setTasks([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/tasks?workspaceId=${selectedWorkspace}`
        );
        if (!res.ok) throw new Error("Failed to load tasks");
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedWorkspace]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const tasksByDate = tasks.reduce(
    (acc, task) => {
      if (task.dueDate) {
        const dateStr = new Date(task.dueDate).toISOString().split("T")[0];
        acc[dateStr] = acc[dateStr] || [];
        acc[dateStr].push(task);
      }
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setExpandedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setExpandedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setExpandedDay(null);
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
        Select a workspace to view the calendar
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-400">
            {tasks.filter((t) => t.dueDate).length} tasks with due dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={goToPrevMonth}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-gray-800">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={goToNextMonth}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-semibold text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells for first day offset */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/30 sm:min-h-[100px]"
            />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const date = new Date(year, month, dayNum);
            const dateStr = date.toISOString().split("T")[0];
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday =
              isCurrentMonth && today.getDate() === dayNum;
            const isExpanded = expandedDay === dateStr;

            return (
              <motion.div
                key={dateStr}
                className={`min-h-[80px] cursor-pointer border-b border-r border-gray-50 p-1.5 transition-colors sm:min-h-[100px] sm:p-2 ${
                  isToday
                    ? "bg-emerald-50/50"
                    : "hover:bg-gray-50/50"
                }`}
                onClick={() =>
                  setExpandedDay(isExpanded ? null : dateStr)
                }
              >
                <div
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-emerald-500 text-white"
                      : "text-gray-700"
                  }`}
                >
                  {dayNum}
                </div>

                {/* Task pills */}
                <div className="space-y-0.5">
                  {dayTasks
                    .slice(0, isExpanded ? dayTasks.length : 2)
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] sm:text-xs ${
                          task.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDot[task.priority]}`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                  {!isExpanded && dayTasks.length > 2 && (
                    <span className="block text-[10px] text-gray-400">
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Priority legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        {Object.entries(priorityDot).map(([key, color]) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            {key === "no_priority" ? "None" : key.charAt(0).toUpperCase() + key.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
