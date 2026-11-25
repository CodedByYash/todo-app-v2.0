"use client";

import { Bell, Command, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const DashboardHeader = () => {
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notification");
        if (res.ok) {
          const data = await res.json();
          const unread = Array.isArray(data)
            ? data.filter((n: { read: boolean }) => !n.read).length
            : 0;
          setNotificationCount(unread);
        }
      } catch {
        // silent
      }
    };
    fetchNotifications();
  }, []);

  const userName = session?.user?.name || session?.user?.username || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 mb-3 rounded-2xl bg-[#f7f7f7] px-4 py-3 pl-14 shadow-sm sm:px-6 sm:py-5 sm:pl-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
        {/* Search */}
        <div className="relative mx-auto flex w-full max-w-xs items-center rounded-2xl bg-white sm:mx-0 sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search task"
            className="w-full rounded-2xl py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Search tasks"
          />
          <span className="mr-2 flex items-center gap-1 rounded-xl bg-[#f7f7f7] px-1.5 py-1">
            <Command className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">F</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Notification bell */}
          <Link href="/notification">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-full bg-white p-2 text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={`View ${notificationCount} notifications`}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </motion.button>
          </Link>

          {/* User profile */}
          <Link href="/settings" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20"
            >
              <span className="text-xs font-semibold text-white">
                {initials}
              </span>
            </motion.div>
            <div className="hidden text-left sm:block">
              <div className="text-sm font-semibold text-gray-900">
                {userName}
              </div>
              <div className="text-xs text-gray-400">{userEmail}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
