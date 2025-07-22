import React from "react";

interface ProjectProgressProps {
  completedPercentage: number;
  inProgressPercentage: number;
  pendingPercentage: number;
  title?: string;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  completedPercentage,
  inProgressPercentage,
  pendingPercentage,
  title = "Project Progress",
}) => {
  // Calculate the circumference for the progress circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dash arrays for each segment
  const completedStroke = (completedPercentage / 100) * circumference;
  const inProgressStroke = (inProgressPercentage / 100) * circumference;
  const pendingStroke = (pendingPercentage / 100) * circumference;

  // Starting positions for each segment
  const completedOffset = 0;
  const inProgressOffset = completedStroke;
  const pendingOffset = completedStroke + inProgressStroke;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>

      {/* Progress Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="8"
            />

            {/* Completed Progress */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={`${completedStroke} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />

            {/* In Progress */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#8b5cf6"
              strokeWidth="8"
              strokeDasharray={`${inProgressStroke} ${circumference}`}
              strokeDashoffset={-inProgressOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />

            {/* Pending (Striped pattern) */}
            <defs>
              <pattern
                id="stripes"
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
                patternTransform="rotate(45)"
              >
                <rect width="4" height="4" fill="#e5e7eb" />
                <rect width="2" height="4" fill="#9ca3af" />
              </pattern>
            </defs>

            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="url(#stripes)"
              strokeWidth="8"
              strokeDasharray={`${pendingStroke} ${circumference}`}
              strokeDashoffset={-pendingOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {completedPercentage}%
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Project Status
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      {/* <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {completedPercentage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-violet-500"></div>
            <span className="text-sm font-medium text-gray-700">
              In Progress
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {inProgressPercentage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-400 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 transform rotate-45 bg-repeat"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)",
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Pending</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {pendingPercentage}%
          </span>
        </div>
      </div> */}
      <div className=""></div>
    </div>
  );
};

export default ProjectProgress;
