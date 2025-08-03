import { CheckCircle2Icon, Plus } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReminderFormModal from "../Modal/ReminderFormModal";

interface Reminder {
  id: string;
  title: string;
  body: string;
  read: boolean;
  reminderDate: Date;
}

const Reminders = () => {
  // const { theme } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { textSecondary } = useTheme();
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  useEffect(() => {
    const fetchReminders = async () => {
      const response = await fetch("/api/reminders");
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
        console.log(data);
        console.log(typeof data.reminderDate);
      }
    };
    fetchReminders();
  }, []);

  const markAsCompleted = async (id: string) => {
    await fetch("/api/reminders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setReminders(reminders.filter((n) => n.id != id));
  };
  return (
    <div className="col-span-1 rounded-[2rem] bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 shadow sm:p-6">
      <div className="space-y-2 sm:space-y-3">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-medium text-stone-900 sm:text-xl md:text-2xl">
            Reminders
          </h1>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-r from-green-300 via-emerald-600 to-green-900 p-1 text-white"
            aria-label="Add reminder"
            onClick={() => setReminderModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto rounded-3xl bg-white p-4 shadow sm:max-h-80 sm:space-y-3 sm:p-6">
          {reminders.length > 0 ? (
            reminders.map((reminder) => {
              const reminderDate = new Date(reminder.reminderDate);
              const hour = reminderDate.getHours();
              const minute = reminderDate.getMinutes();
              const timestring = `${hour}:${minute}`;
              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-lg font-medium text-slate-800 normal-case sm:text-xl md:text-2xl">
                      {reminder.title}
                    </h1>
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-2 rounded-full bg-white sm:mt-0"
                    >
                      <CheckCircle2Icon
                        className="h-6 w-6 cursor-pointer text-slate-800 transition hover:text-slate-700 sm:h-8 sm:w-8"
                        aria-label="Mark reminder as complete"
                        onClick={() => markAsCompleted(reminder.id)}
                      />
                    </motion.div>
                  </div>
                  <div className="text-md flex justify-center font-medium text-gray-600 normal-case sm:justify-start sm:text-lg">
                    {reminder.body}
                  </div>
                  <div className="text-md font-medium text-gray-600 sm:text-lg">
                    {timestring}
                  </div>
                </>
              );
            })
          ) : (
            <p className={textSecondary}>No new reminders.</p>
          )}
        </div>
      </div>
      <ReminderFormModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
      />
    </div>
  );
};

export default Reminders;
