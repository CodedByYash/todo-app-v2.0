"use client";

import { PauseCircle, PlayCircle, Square, RotateCcw, Timer } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

interface TimeTrackerProps {
  selectedTask?: { id: number; title: string };
  updateTaskTime?: (id: number, time: number) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({
  selectedTask,
  updateTaskTime,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    if (selectedTask && updateTaskTime && seconds > 0) {
      updateTaskTime(selectedTask.id, seconds);
    }
    setSeconds(0);
  }, [selectedTask, updateTaskTime, seconds]);

  const handleReset = useCallback(() => {
    if (selectedTask && updateTaskTime && seconds > 0) {
      updateTaskTime(selectedTask.id, seconds);
    }
    setSeconds(0);
  }, [selectedTask, updateTaskTime, seconds]);

  const progress = seconds > 0 ? Math.min((seconds % 3600) / 3600, 1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl bg-gradient-to-br from-stone-50 via-slate-200 to-stone-200 p-5 h-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">Time Tracker</h2>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60">
          <Timer className="h-4 w-4 text-stone-600" />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        {selectedTask && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 text-center text-sm text-gray-500"
          >
            Tracking: <span className="font-medium text-gray-700">{selectedTask.title}</span>
          </motion.p>
        )}

        {/* Timer ring */}
        <div className="relative mx-auto mb-4 flex h-36 w-36 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#10b981"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - progress) }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          <span
            className="text-3xl font-semibold tabular-nums text-gray-800"
            role="timer"
            aria-live="polite"
          >
            {formatTime(seconds)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            onClick={handlePlayPause}
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? (
              <PauseCircle className="h-5 w-5" />
            ) : (
              <PlayCircle className="h-5 w-5" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            onClick={handleStop}
            aria-label="Stop and reset timer"
          >
            <Square className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            onClick={handleReset}
            aria-label="Reset timer"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isRunning ? "animate-pulse bg-emerald-500" : "bg-gray-300"
            }`}
          />
          <span className="text-xs text-gray-400">
            {isRunning ? "Running" : seconds > 0 ? "Paused" : "Ready"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeTracker;
