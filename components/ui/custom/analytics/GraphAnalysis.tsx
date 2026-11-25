"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

interface TaskData {
  day: string;
  completed: number;
  uncompleted: number;
}

interface GraphAnalyticsProps {
  data: TaskData[];
}

const getCompletionRatio = (completed: number, uncompleted: number) => {
  const total = completed + uncompleted;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
};

const getBarColor = (percent: number) => {
  if (percent >= 80) return "bg-emerald-600";
  if (percent >= 60) return "bg-emerald-500";
  if (percent >= 40) return "bg-emerald-400";
  if (percent >= 20) return "bg-emerald-300";
  if (percent > 0) return "bg-emerald-200";
  return "bg-gray-200";
};

const GraphAnalysis: React.FC<GraphAnalyticsProps> = ({ data }) => {
  const barColors = useMemo(
    () =>
      data.map(({ completed, uncompleted }) =>
        getBarColor(getCompletionRatio(completed, uncompleted))
      ),
    [data]
  );

  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalUncompleted = data.reduce((sum, d) => sum + d.uncompleted, 0);
  const totalAll = totalCompleted + totalUncompleted;
  const overallRate = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0;

  return (
    <div className="col-span-2 flex h-full min-h-[200px] w-full flex-col rounded-[2rem] bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 shadow sm:min-h-[250px] sm:p-5 md:min-h-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-stone-900 sm:text-xl">
          Weekly Productivity
        </h3>
        <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          {overallRate}% done
        </span>
      </div>

      <div className="scrollbar-hide flex flex-1 flex-col rounded-3xl bg-white p-4 shadow-sm sm:p-5">
        {/* Legend */}
        <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            Remaining
          </span>
        </div>

        {/* Chart area */}
        <div className="relative flex flex-1 items-end gap-1 sm:gap-2">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-[10px] text-gray-300">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>

          {/* Bars */}
          <div className="ml-8 flex flex-1 items-end justify-between gap-1 sm:gap-2">
            {data.map(({ day, completed, uncompleted }, index) => {
              const percent = getCompletionRatio(completed, uncompleted);
              return (
                <div
                  key={day}
                  className="group relative flex h-full w-full max-w-[40px] flex-col items-center"
                >
                  {/* Bar */}
                  <div className="flex h-full w-full items-end justify-center">
                    <motion.div
                      className={`w-full rounded-t-lg ${barColors[index]} min-h-[4px]`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(percent, 4)}%` }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                    />
                  </div>

                  {/* Day label */}
                  <span className="mt-2 text-xs text-gray-500">{day}</span>

                  {/* Tooltip */}
                  {percent > 0 && (
                    <div className="pointer-events-none absolute -top-6 z-10 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                      {percent}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphAnalysis;
