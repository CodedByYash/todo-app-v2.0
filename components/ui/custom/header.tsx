import { Bell, Search } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="shadow-sm rounded-2xl px-6 py-5 bg-[#f7f7f7] mb-3">
      <div className="flex items-center justify-between">
        <div className="relative bg-[#FFFFFF] rounded-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search task"
            className="pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 bg-[#FFFFFF] rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">TM</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                Totok Michael
              </div>
              <div className="text-xs text-gray-500">tmichael20@gmail.com</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
