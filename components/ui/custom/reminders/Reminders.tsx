import { CheckCircle2Icon, Play } from "lucide-react";

const Reminders = () => {
  return (
    // <div className="bg-white p-6 rounded-4xl shadow">
    //   <h1 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h1>
    //   <div className="space-y-4">
    //     <div className="flex items-center justify-between">
    //       <div>
    //         <div className="font-medium text-gray-900">
    //           Meeting with Arc Company
    //         </div>
    //         <div className="text-sm text-gray-500">
    //           Time: 10:00 pm - 04:00 pm
    //         </div>
    //       </div>
    //     </div>
    //     <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-colors">
    //       <Play className="w-4 h-4" />
    //       <span>Start Meeting</span>
    //     </button>
    //   </div>
    // </div>
    <div className="bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-6 rounded-4xl shadow">
      <div className="space-y-1">
        <h1 className="font-bold text-2xl text-gray-900 mb-4">Reminders</h1>
        <div className="rounded-4xl bg-white shadow p-6 space-y-3">
          <div className="flex items-center">
            <h1 className="text-2xl font-medium text-slate-800">
              Meeting with Arch Company
            </h1>
            <div className="rounded-full bg-white">
              <CheckCircle2Icon className="w-8 h-8 text-slate-800 hover:text-slate-700 cursor-pointer transition" />
            </div>
          </div>
          <div className="font-medium text-lg text-gray-600">
            Time: 7:00 to 8:00
          </div>
          <div className="flex items-center justify-center">
            <button className="bg-gradient-to-r from-green-300 via-emerald-600 to-green-900 rounded-full px-4 py-2 text-white text-xl w-full">
              Start Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
