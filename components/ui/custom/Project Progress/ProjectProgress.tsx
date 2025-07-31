// components/TodaysProgress.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useTheme } from "@/components/ui/custom/ThemeProvider";

const ProjectProgress = () => {
  const { textPrimary, cardBg, inputBorder, textSecondary } = useTheme();
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    progress: 0,
  });

  useEffect(() => {
    const fetchProgress = async () => {
      const response = await fetch("/api/today-progress");
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    };
    fetchProgress();
  }, []);

  return (
    <motion.div
      className={`${cardBg} rounded-2xl p-6 shadow-lg border ${inputBorder}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.0, duration: 0.3 }}
    >
      <h3 className={`${textPrimary} text-lg font-semibold mb-4`}>
        Today’s Progress
      </h3>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-emerald-500 h-2.5 rounded-full"
          style={{ width: `${progress.progress}%` }}
        ></div>
      </div>
      <p className={`${textSecondary} mt-2`}>
        {progress.completed} of {progress.total} tasks completed (
        {progress.progress.toFixed(1)}%)
      </p>
    </motion.div>
  );
};
export default ProjectProgress;
