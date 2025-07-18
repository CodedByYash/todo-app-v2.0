import { ArrowUpRight, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  count: number;
  description: string;
  variant?: "neutral" | "success" | "danger" | "info"; // Add more as needed
}

const variantStyles = {
  neutral: {
    container: "bg-gradient-to-br from-neutral-50 to-neutral-300 text-black",
    description: "bg-gradient-to-r from-gray-700 to-gray-500",
  },
  success: {
    container: "bg-gradient-to-br from-green-500 to-green-950 text-white",
    description:
      "bg-gradient-to-r from-lime-500 to-lime-300 hover:from-lime-400 hover:to-lime-200",
  },
  danger: {
    container: "bg-gradient-to-br from-red-500 to-red-800 text-white",
    description:
      "bg-gradient-to-r from-red-400 to-red-300 hover:from-red-300 hover:to-red-200",
  },
  info: {
    container: "bg-gradient-to-br from-blue-400 to-blue-800 text-white",
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
  const styles = variantStyles[variant];

  return (
    <div className={`p-4 rounded-4xl flex flex-col ${styles.container}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">{title}</h1>
        <button className="bg-white border border-slate-500 rounded-full p-1">
          <ArrowUpRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="text-5xl mt-3 mb-1">{count}</div>
      <div className="flex items-center justify-start gap-3">
        <TrendingUp className="w-3 h-3 mr-1" />
        <h1
          className={`text-transparent bg-clip-text transition ${styles.description}`}
        >
          {description}
        </h1>
      </div>
    </div>
  );
};

export default StatCard;
