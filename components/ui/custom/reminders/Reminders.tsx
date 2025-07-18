import { Play } from "lucide-react";

const Reminders = () => {
  return (
    <div className="bg-white p-6 rounded-4xl shadow ">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">
              Meeting with Arc Company
            </div>
            <div className="text-sm text-gray-500">
              Time: 10:00 pm - 04:00 pm
            </div>
          </div>
        </div>
        <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-colors">
          <Play className="w-4 h-4" />
          <span>Start Meeting</span>
        </button>
      </div>
    </div>
  );
};

export default Reminders;
