"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Flag,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

const PRIORITY_OPTIONS = [
  { value: "no_priority", label: "No Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const PRIORITY_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; dot: string }
> = {
  high: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  medium: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  low: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  no_priority: {
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [form, setForm] = useState({
    title: "",
    priority: "no_priority" as Task["priority"],
    dueDate: "",
  });

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load task");
        }
        const data: Task = await res.json();
        setTask(data);
        setForm({
          title: data.title,
          priority: data.priority,
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTask();
  }, [id]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          priority: form.priority,
          dueDate: form.dueDate || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save task");
      }
      const data: Task = await res.json();
      setTask(data);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const data: Task = await res.json();
      setTask(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task"
      );
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      router.push("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const isOverdue =
    task?.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-sm">Loading task...</span>
      </div>
    );
  }

  if (error && !task) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="mb-1 text-lg font-semibold text-red-700">
            Something went wrong
          </p>
          <p className="mb-6 text-sm text-red-600">{error}</p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tasks
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!task) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-gray-500">Task not found.</p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tasks
          </Link>
        </div>
      </motion.div>
    );
  }

  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.no_priority;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto max-w-2xl"
    >
      {/* Back link */}
      <Link
        href="/tasks"
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </Link>

      {/* Main card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div className="flex items-start gap-4">
            {/* Completion toggle */}
            <motion.button
              onClick={handleToggleComplete}
              disabled={toggling}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="mt-0.5 flex-shrink-0 disabled:opacity-50"
              aria-label={
                task.completed ? "Mark as incomplete" : "Mark as complete"
              }
            >
              {task.completed ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              ) : (
                <Circle className="h-7 w-7 text-gray-300 hover:text-emerald-400" />
              )}
            </motion.button>

            <div>
              <h1
                className={`text-xl font-semibold ${
                  task.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* Priority badge */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConf.bg} ${priorityConf.color} ${priorityConf.border} border`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${priorityConf.dot}`}
                  />
                  {task.priority === "no_priority"
                    ? "No priority"
                    : task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                </span>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    task.completed
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : isOverdue
                        ? "border border-red-200 bg-red-50 text-red-700"
                        : "border border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  {task.completed
                    ? "Completed"
                    : isOverdue
                      ? "Overdue"
                      : "In Progress"}
                </span>
              </div>
            </div>
          </div>

          {!editMode && (
            <motion.button
              onClick={() => setEditMode(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </motion.button>
          )}
        </div>

        {/* Error bar */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {editMode ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as Task["priority"],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={handleSave}
                    disabled={saving || !form.title.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setError("");
                      setForm({
                        title: task.title,
                        priority: task.priority,
                        dueDate: task.dueDate
                          ? task.dueDate.split("T")[0]
                          : "",
                      });
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Detail rows */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Flag className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Priority</p>
                      <p className="text-sm font-medium text-gray-800">
                        {task.priority === "no_priority"
                          ? "No priority"
                          : task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Due Date</p>
                      <p
                        className={`text-sm font-medium ${
                          isOverdue ? "text-red-600" : "text-gray-800"
                        }`}
                      >
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "No due date"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Created</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(task.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Last Updated</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(task.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {!editMode && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <motion.button
              onClick={handleToggleComplete}
              disabled={toggling}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                task.completed
                  ? "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              } disabled:opacity-50`}
            >
              {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : task.completed ? (
                <Circle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {task.completed ? "Reopen Task" : "Mark Complete"}
            </motion.button>

            <motion.button
              onClick={handleDelete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskDetails;
