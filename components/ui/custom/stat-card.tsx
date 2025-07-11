import { ArrowUpRight, TrendingUp } from "lucide-react";

interface statCard {
  title: string;
  count: number;
  description: string;
}

const StatCard: React.FC<statCard> = ({ title, count, description }) => {
  return (
    <div className="bg-white p-4 rounded-2xl">
      <div className="flex flex-col items-start ">
        <div>
          <div className="text-gray-500 text-lg flex items-center justify-between space-x-[45px]">
            <h1>{title}</h1>
            <button className="bg-[#ffffff] border border-slate-500 rounded-full p-1">
              <ArrowUpRight className="w-5 h-5 text-slate-500 " />
            </button>
          </div>
          <div className="text-5xl mt-2 text-gray-800">{count}</div>
          <div className="text-gray-500 text-xs flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
