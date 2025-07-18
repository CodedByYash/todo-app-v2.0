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
  if (percent >= 75) return "bg-green-900";
  if (percent >= 50) return "bg-green-700";
  if (percent >= 25) return "bg-green-500";
  if (percent > 0) return "bg-green-300";
  return "bg-gray-200 border border-gray-300 bg-[repeating-linear-gradient(45deg,_#e5e7eb,_#e5e7eb_5px,_#f3f4f6_5px,_#f3f4f6_10px)]";
};

const GraphAnalysis: React.FC<GraphAnalyticsProps> = ({ data }) => {
  return (
    <div className="p-6 rounded-[2rem] shadow w-full h-full bg-gradient-to-br from-stone-50 via-gray-300 to-stone-200">
      <h3 className="text-2xl font-semibold text-gray-800 mb-8">
        Weekly Productivity Tracker
      </h3>
      <div className="flex items-baseline justify-between space-x-2 h-40">
        {data.map(({ day, completed, uncompleted }) => {
          const percent = getCompletionRatio(completed, uncompleted);
          console.log(`Day: ${day}, %: ${percent}`);
          const barColor = getBarColor(percent);
          console.log(`Day: ${day}, %: ${barColor}`);
          return (
            <div
              key={day}
              className="flex flex-col items-center group h-full w-8 relative"
            >
              <div
                className={`rounded-full w-full transition-all duration-300  ${barColor}`}
                style={{ height: `${percent}%` }}
              />
              <span className="text-sm text-gray-500 mt-2">{day}</span>

              {percent > 0 && (
                <div className="opacity-0 group-hover:opacity-100 transition text-xs absolute bg-white border px-1 py-0.5 rounded shadow mt-[-2rem]">
                  {percent}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GraphAnalysis;
