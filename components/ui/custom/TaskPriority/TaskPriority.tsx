"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Circle, CheckCircle2, Calendar, ArrowRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "no_priority" | "low" | "medium" | "high";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskPriorityProps {
  Tasks: Task[];
}

const priorityConfig = {
  high: { label: "High", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  medium: { label: "Medium", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  low: { label: "Low", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  no_priority: { label: "None", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

const TaskPriority: React.FC<TaskPriorityProps> = ({ Tasks }) => {
  const activeTasks = Tasks.filter((t) => !t.completed).slice(0, 6);

  return (
    <div className="col-span-2 flex h-full min-h-[200px] w-full flex-col rounded-[2rem] bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 shadow sm:min-h-[250px] sm:p-5 md:min-h-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-stone-900 sm:text-xl">
          Active Tasks
        </h3>
        <Link
          href="/tasks"
          className="flex items-center gap-1 text-xs font-medium text-emerald-700 transition hover:text-emerald-900"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="scrollbar-hide flex-1 space-y-2 overflow-y-auto rounded-3xl bg-white p-4 shadow-sm">
        {activeTasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-300" />
            <p className="text-sm text-gray-400">No active tasks</p>
          </div>
        ) : (
          activeTasks.map((task, index) => {
            const priority = priorityConfig[task.priority];
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  href={`/tasks/${task.id}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <Circle className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-emerald-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priority.bg} ${priority.text}`}
                  >
                    {priority.label}
                  </span>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskPriority;
