import { CheckCircle2Icon } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useEffect, useState } from "react";

interface Reminder {
  id: string;
  title: string;
  body: string;
  read: boolean;
  time: Date;
}

const Reminders = () => {
  // const { theme } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { textSecondary } = useTheme();

  useEffect(() => {
    const fetchReminders = async () => {
      const response = await fetch("/api/reminders");
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
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
    <div className="bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 sm:p-6 rounded-[2rem] shadow">
      <div className="space-y-2 sm:space-y-3">
        <h1 className="font-medium text-lg sm:text-xl md:text-2xl text-stone-900 mb-4">
          Reminders
        </h1>
        <div className="rounded-3xl bg-white shadow p-4 sm:p-6 space-y-2 sm:space-y-3 overflow-y-auto max-h-64 sm:max-h-80">
          {reminders.length > 0 ? (
            reminders.map((reminder) => {
              const hour = reminder.time.getUTCHours();
              const minute = reminder.time.getUTCMinutes();
              const timestring = `${hour}:${minute}`;
              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-slate-800">
                      {reminder.title}
                    </h1>
                    <div className="rounded-full bg-white mt-2 sm:mt-0">
                      <CheckCircle2Icon
                        className="w-6 h-6 sm:w-8 sm:h-8 text-slate-800 hover:text-slate-700 cursor-pointer transition"
                        aria-label="Mark reminder as complete"
                      />
                    </div>
                  </div>
                  <div className="font-medium text-sm sm:text-base md:text-lg text-gray-600">
                    {timestring}
                  </div>
                  <div className="flex justify-center sm:justify-start">
                    <button
                      className="bg-gradient-to-r from-green-300 via-emerald-600 to-green-900 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-white text-base sm:text-lg md:text-xl w-full sm:w-auto"
                      aria-label="Start meeting with Arch Company"
                    >
                      {reminder.body}
                    </button>
                  </div>
                </>
              );
            })
          ) : (
            <p className={textSecondary}>No new reminders.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;
