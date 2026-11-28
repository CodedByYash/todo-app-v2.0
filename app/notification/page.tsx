"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
};

type Notification = {
  task: Task;
  type: "overdue" | "due_soon";
  hoursLeft: number;
};

const Notifications = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const url = selectedWorkspace
          ? `/api/tasks?workspaceId=${selectedWorkspace}`
          : "/api/tasks";
        const res = await fetch(url);
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

  const getNotifications = (): Notification[] => {
    const now = new Date();
    return tasks
      .filter((task) => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        const diff = (dueDate.getTime() - now.getTime()) / (1000 * 3600);
        return diff <= 24 || diff < 0;
      })
      .map((task) => {
        const dueDate = new Date(task.dueDate!);
        const now = new Date();
        const hoursLeft =
          (dueDate.getTime() - now.getTime()) / (1000 * 3600);
        return {
          task,
          type: hoursLeft < 0 ? ("overdue" as const) : ("due_soon" as const),
          hoursLeft,
        };
      })
      .sort((a, b) => a.hoursLeft - b.hoursLeft);
  };

  const notifications = getNotifications();
  const overdueCount = notifications.filter((n) => n.type === "overdue").length;
  const dueSoonCount = notifications.filter(
    (n) => n.type === "due_soon"
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
        <p className="mt-1 text-gray-400">
          Tasks that need your attention
        </p>
      </div>

      {/* Summary badges */}
      {notifications.length > 0 && (
        <div className="flex gap-3">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              {overdueCount} overdue
            </span>
          )}
          {dueSoonCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              {dueSoonCount} due soon
            </span>
          )}
        </div>
      )}

      {/* Notification list */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.task.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                  notif.type === "overdue"
                    ? "border-red-200 bg-red-50/60"
                    : "border-amber-200 bg-amber-50/60"
                }`}
              >
                <div
                  className={`mt-0.5 rounded-full p-2 ${
                    notif.type === "overdue"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {notif.type === "overdue" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {notif.task.title}
                  </h3>
                  <p
                    className={`mt-0.5 text-sm ${
                      notif.type === "overdue"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {notif.type === "overdue"
                      ? `Overdue by ${Math.abs(Math.round(notif.hoursLeft))}h`
                      : `Due in ${Math.round(notif.hoursLeft)}h`}
                  </p>
                  {notif.task.dueDate && (
                    <p className="mt-1 text-xs text-gray-400">
                      Due:{" "}
                      {new Date(notif.task.dueDate).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center"
        >
          <div className="rounded-full bg-emerald-50 p-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            All caught up!
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            No overdue or upcoming tasks right now
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;
