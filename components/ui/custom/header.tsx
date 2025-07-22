import { Bell, Command, Search } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-30 shadow-sm rounded-2xl px-4 sm:px-6 py-3 sm:py-5 pl-14 sm:pl-6 bg-[#f7f7f7] mb-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="relative bg-[#FFFFFF] rounded-2xl flex items-center w-full sm:w-64 md:w-80 max-w-xs mx-auto sm:mx-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 sm:w-6 h-6" />
          <input
            type="text"
            placeholder="Search task"
            className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
            aria-label="Search tasks"
          />
          <span className="bg-[#f7f7f7] rounded-xl flex items-center space-x-1 p-1 sm:p-1.5 mr-2">
            <span>
              <Command className="w-3 h-3 sm:w-4 h-4 text-gray-400" />
            </span>
            <p className="text-[12px] sm:text-[14px] text-gray-400">F</p>
          </span>
        </div>

        <div className="flex gap-4 sm:gap-6">
          <button
            className="relative p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 bg-[#FFFFFF] rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="View 3 notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 h-5" />
            <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-red-600 text-white text-[10px] sm:text-xs rounded-full w-3 h-3 sm:w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div
              className="w-7 h-7 sm:w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
              aria-label="User avatar for Totok Michael"
            >
              <span className="text-white text-[12px] sm:text-sm font-medium">
                TM
              </span>
            </div>
            <div className="text-left">
              <div className="text-[14px] sm:text-[16px] font-bold text-gray-900">
                Totok Michael
              </div>
              <div className="text MOUSEOVER TO DISPLAY: text-[12px] sm:text-[14px] text-gray-400">
                tmichael20@gmail.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
