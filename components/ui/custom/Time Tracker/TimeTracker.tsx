import { PauseCircle, PlayCircle, Square, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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

  // Timer logic
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

  // Format time as HH:MM:SS
  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Start or pause timer
  const handlePlayPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Stop and reset timer
  const handleStop = useCallback(() => {
    setIsRunning(false);
    if (selectedTask && updateTaskTime && seconds > 0) {
      updateTaskTime(selectedTask.id, seconds);
    }
    setSeconds(0);
  }, [selectedTask, updateTaskTime, seconds]);

  // Reset timer without stopping
  const handleReset = useCallback(() => {
    if (selectedTask && updateTaskTime && seconds > 0) {
      updateTaskTime(selectedTask.id, seconds);
    }
    setSeconds(0);
  }, [selectedTask, updateTaskTime, seconds]);

  return (
    <div className="bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 sm:p-6 rounded-2xl h-full">
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-stone-900 mb-4">
          Time Tracker
        </h1>
      </div>
      <div className="bg-white p-3 sm:p-4 rounded-2xl flex flex-col items-center m-2 sm:m-4 shadow-sm">
        {selectedTask && (
          <div className="text-sm sm:text-base text-gray-600 mb-2">
            Tracking: {selectedTask.title}
          </div>
        )}
        <span
          className="text-3xl sm:text-4xl md:text-5xl font-medium text-gray-800"
          role="timer"
          aria-live="polite"
        >
          {formatTime(seconds)}
        </span>
        <div className="flex mt-3 sm:mt-4 space-x-3 sm:space-x-4">
          <button
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-0.5 sm:p-1 rounded-full hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onClick={handlePlayPause}
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? (
              <PauseCircle className="w-6 h-6 sm:w-8 h-8 text-white" />
            ) : (
              <PlayCircle className="w-6 h-6 sm:w-8 h-8 text-white" />
            )}
          </button>
          <button
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-0.5 sm:p-1 rounded-full hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onClick={handleStop}
            aria-label="Stop and reset timer"
          >
            <Square className="w-6 h-6 sm:w-8 h-8 text-white" />
          </button>
          <button
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-0.5 sm:p-1 rounded-full hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onClick={handleReset}
            aria-label="Reset timer"
          >
            <RotateCcw className="w-6 h-6 sm:w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
