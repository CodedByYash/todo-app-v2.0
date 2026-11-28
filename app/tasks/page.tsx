"use client";

import { useWorkspace } from "@/components/WorkspaceProvider";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Funnel,
  X,
  Circle,
  CheckCircle2,
  Calendar,
  Inbox,
} from "lucide-react";
import TaskFormModal from "@/components/ui/custom/Modal/TasksModal";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: "no_priority" | "low" | "medium" | "high";
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tagIds?: string[];
  workspaceId: string;
  userId: string;
};

const priorityConfig = {
  high: {
    label: "High",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  low: {
    label: "Low",
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  no_priority: {
    label: "None",
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
  },
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { selectedWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const url = selectedWorkspace
        ? `/api/tasks?workspaceId=${selectedWorkspace}`
        : "/api/tasks";
      try {
        const res = await fetch(url);
        const data: unknown = await res.json();
        type RawTask = Omit<Task, "dueDate" | "createdAt" | "updatedAt"> & {
          dueDate: string | null;
          createdAt: string;
          updatedAt: string;
        };
        const normalized: Task[] = (res.ok && Array.isArray(data) ? (data as RawTask[]) : []).map((t) => ({
          ...t,
          dueDate: t?.dueDate ? new Date(t.dueDate) : null,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        setTasks(normalized);
        setFilteredTasks(normalized);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedWorkspace]);

  useEffect(() => {
    let result = [...tasks];
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (filterStatus === "completed") {
      result = result.filter((t) => t.completed);
    } else if (filterStatus === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filterStatus === "overdue") {
      result = result.filter(
        (t) => t.dueDate && t.dueDate < new Date() && !t.completed
      );
    }
    setFilteredTasks(result);
  }, [filterPriority, filterStatus, tasks]);

  const toggleComplete = async (task: Task) => {
    const newCompleted = !task.completed;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: newCompleted } : t
      )
    );
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newCompleted }),
      });
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !newCompleted } : t
        )
      );
    }
  };

  const clearFilters = () => {
    setFilterPriority("all");
    setFilterStatus("all");
  };

  const hasFilters = filterPriority !== "all" || filterStatus !== "all";

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Tasks</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
            <span>{totalCount} total</span>
            <span>·</span>
            <span className="text-emerald-600">{completedCount} done</span>
            <span>·</span>
            <span>{activeCount} active</span>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setTaskModalOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </motion.button>
          <TaskFormModal
            isOpen={taskModalOpen}
            onClose={() => setTaskModalOpen(false)}
          />
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              hasFilters
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Funnel className="h-3.5 w-3.5" />
            Filter
            {hasFilters && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500">
                  Priority:
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-300"
                >
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="no_priority">None</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500">
                  Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-300"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-600"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.map((task, index) => {
              const priority = priorityConfig[task.priority];
              const isOverdue =
                task.dueDate && task.dueDate < new Date() && !task.completed;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group flex items-center gap-3 rounded-xl border bg-white p-3 transition-all hover:shadow-sm sm:p-4 ${
                    task.completed
                      ? "border-gray-100 bg-gray-50/50"
                      : isOverdue
                        ? "border-red-100"
                        : "border-gray-100"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(task)}
                    className="shrink-0"
                    aria-label={
                      task.completed
                        ? "Mark as incomplete"
                        : "Mark as complete"
                    }
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300 transition group-hover:text-emerald-400" />
                    )}
                  </button>

                  {/* Task info */}
                  <Link
                    href={`/tasks/${task.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <span
                        className={`mt-0.5 flex items-center gap-1 text-xs ${
                          isOverdue ? "text-red-500" : "text-gray-400"
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        {task.dueDate.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                        {isOverdue && " · Overdue"}
                      </span>
                    )}
                  </Link>

                  {/* Priority badge */}
                  <span
                    className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:inline-flex ${priority.bg} ${priority.text}`}
                  >
                    {priority.label}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center"
        >
          <div className="rounded-full bg-gray-50 p-4">
            <Inbox className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="mt-4 text-base font-medium text-gray-700">
            {hasFilters ? "No tasks match your filters" : "No tasks yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {hasFilters
              ? "Try adjusting your filters"
              : "Create your first task to get started"}
          </p>
          {!hasFilters && (
            <button
              onClick={() => setTaskModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;
