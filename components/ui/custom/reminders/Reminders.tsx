"use client";

import { CheckCircle2Icon, Plus, Clock } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useState } from "react";
import { motion } from "motion/react";
import ReminderFormModal from "../Modal/ReminderFormModal";

export interface Reminder {
  id: string;
  title: string;
  body: string | null;
  reminderDate: string;
  createdAt: string;
}

interface ReminderProps {
  Reminder: Reminder[];
  onComplete: (id: string) => void;
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const Reminders: React.FC<ReminderProps> = ({ Reminder, onComplete }) => {
  const { textSecondary } = useTheme();
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  return (
    <div className="col-span-1 flex flex-col rounded-[2rem] bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 shadow sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-stone-900 sm:text-xl">
          Reminders
        </h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 p-1.5 text-white shadow-sm"
          aria-label="Add reminder"
          onClick={() => setReminderModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="scrollbar-hide max-h-72 flex-1 space-y-2 overflow-y-auto rounded-3xl bg-white p-4 shadow-sm">
        {Reminder.length > 0 ? (
          Reminder.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50"
            >
              <div className="mt-0.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onComplete(reminder.id)}
                  aria-label="Mark reminder as complete"
                >
                  <CheckCircle2Icon className="h-5 w-5 text-gray-300 transition hover:text-emerald-500" />
                </motion.button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {reminder.title}
                </p>
                {reminder.body && (
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {reminder.body}
                  </p>
                )}
                <span className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDate(reminder.reminderDate)} · {formatTime(reminder.reminderDate)}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-400">No reminders</p>
          </div>
        )}
      </div>
      <ReminderFormModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
      />
    </div>
  );
};

export default Reminders;
