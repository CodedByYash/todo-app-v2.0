import { ArrowUpRight, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface StatCardProps {
  title: string;
  count: number;
  description: string;
  variant?: "neutral" | "success" | "danger" | "info";
}

const variantStyles = {
  neutral: {
    container:
      "bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 text-black",
    description: "bg-gradient-to-r from-gray-700 to-gray-500",
  },
  success: {
    container: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
    description:
      "bg-gradient-to-r from-lime-500 to-lime-300 hover:from-lime-400 hover:to-lime-200",
  },
  danger: {
    container:
      "bg-gradient-to-br from-red-300 via-red-500 to-red-700 text-black",
    description:
      "bg-gradient-to-r from-red-400 to-red-300 hover:from-red-300 hover:to-red-200",
  },
  info: {
    container:
      "bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 text-black",
    description:
      "bg-gradient-to-r from-sky-300 to-sky-100 hover:from-sky-200 hover:to-sky-50",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  description,
  variant = "neutral",
}) => {
  const styles = useMemo(() => variantStyles[variant], [variant]);

  return (
    <div
      className={`min-w-[120px] sm:min-w-[150px] p-3 sm:p-4 rounded-2xl flex flex-col ${styles.container}`}
      role="region"
      aria-label={`${title} statistics`}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-base sm:text-lg md:text-2xl">{title}</h1>
        <button
          className="bg-white border border-slate-500 rounded-full p-0.5 sm:p-1 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label={`View ${title} details`}
        >
          <ArrowUpRight className="w-4 h-4 sm:w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="text-2xl sm:text-3xl md:text-5xl mt-2 sm:mt-3 mb-1">
        {count}
      </div>
      <div className="flex items-center justify-start gap-2 sm:gap-3">
        <TrendingUp className="w-3 h-3 sm:w-4 h-4 mr-1" aria-hidden="true" />
        <h1
          className={`text-xs sm:text-sm text-transparent bg-clip-text transition ${styles.description}`}
        >
          {description}
        </h1>
      </div>
    </div>
  );
};

export default StatCard;
