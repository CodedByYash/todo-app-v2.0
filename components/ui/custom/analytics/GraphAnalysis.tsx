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
        getBarColor(getCompletionRatio(completed, uncompleted))
      ),
    [data]
  );

  return (
    <div className="p-4 sm:p-6 rounded-[2rem] shadow w-full h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300">
      <h3 className="text-lg sm:text-xl md:text-2xl font-light text-stone-900 mb-4">
        Weekly Productivity Tracker
      </h3>
      <div className="flex items-baseline justify-between space-x-1 sm:space-x-2 bg-white rounded-3xl p-3 sm:p-5 h-40 sm:h-48 md:h-3/4 overflow-x-auto scrollbar-hide">
        {data.map(({ day, completed, uncompleted }, index) => (
          <div
            key={day}
            className="flex flex-col items-center group h-full w-6 sm:w-8 relative"
            aria-label={`${day}: ${getCompletionRatio(
              completed,
              uncompleted
            )}% task completion`}
          >
            <div
              className={`rounded-full w-full transition-all duration-300 ${barColors[index]}`}
              style={{
                height: `${getCompletionRatio(completed, uncompleted)}%`,
              }}
            />
            <span className="text-xs sm:text-sm text-gray-500 mt-2">{day}</span>
            {getCompletionRatio(completed, uncompleted) > 0 && (
              <div className="opacity-0 group-hover:opacity-100 transition text-xs sm:text-sm absolute bg-white border px-1 py-0.5 rounded shadow top-[-1.5rem] sm:top-[-2rem] z-10 pointer-events-none">
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
