import { useMemo } from "react";

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
  if (percent >= 90) return "bg-green-950";
  if (percent >= 80) return "bg-green-900";
  if (percent >= 70) return "bg-green-800";
  if (percent >= 60) return "bg-green-700";
  if (percent > 50) return "bg-green-600";
  if (percent >= 40) return "bg-green-500";
  if (percent >= 30) return "bg-green-400";
  if (percent >= 20) return "bg-green-300";
  if (percent >= 10) return "bg-green-100";
  if (percent >= 0) return "bg-green-100";
  return "bg-gray-200 border border-gray-300 bg-[repeating-linear-gradient(45deg,_#e5e7eb,_#e5e7eb_5px,_#f3f4f6_5px,_#f3f4f6_10px)]";
};

const GraphAnalysis: React.FC<GraphAnalyticsProps> = ({ data }) => {
  const barColors = useMemo(
    () =>
      data.map(({ completed, uncompleted }) =>
        getBarColor(getCompletionRatio(completed, uncompleted)),
      ),
    [data],
  );

  return (
    <div className="col-span-2 h-full min-h-[200px] w-full rounded-[2rem] bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 shadow sm:min-h-[250px] sm:p-6 md:min-h-[300px]">
      <h3 className="mb-4 text-lg font-light text-stone-900 sm:text-xl md:text-2xl">
        Weekly Productivity Tracker
      </h3>
      <div className="scrollbar-hide flex h-40 items-baseline justify-between space-x-1 overflow-x-auto rounded-3xl bg-white p-3 sm:h-48 sm:space-x-2 sm:p-5 md:h-3/4">
        {data.map(({ day, completed, uncompleted }, index) => (
          <div
            key={day}
            className="group relative flex h-full w-6 flex-col items-center sm:w-8"
            aria-label={`${day}: ${getCompletionRatio(
              completed,
              uncompleted,
            )}% task completion`}
          >
            <div
              className={`w-full rounded-full transition-all duration-300 ${barColors[index]}`}
              style={{
                height: `${getCompletionRatio(completed, uncompleted)}%`,
              }}
            />
            <span className="mt-2 text-xs text-gray-500 sm:text-sm">{day}</span>
            {getCompletionRatio(completed, uncompleted) > 0 && (
              <div className="pointer-events-none absolute top-[-1.5rem] z-10 rounded border bg-white px-1 py-0.5 text-xs opacity-0 shadow transition group-hover:opacity-100 sm:top-[-2rem] sm:text-sm">
                {getCompletionRatio(completed, uncompleted)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphAnalysis;
