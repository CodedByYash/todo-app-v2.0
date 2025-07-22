import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, Search } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  initials: string;
  status: "Completed" | "In Progress" | "Idle";
  currentTask: string;
  completionPercentage: number;
}

interface TeamCollaborationProps {
  members: TeamMember[];
}

const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ members }) => {
  const [filter, setFilter] = useState<
    "All" | "Completed" | "In Progress" | "Idle"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter((member) => {
    const matchesFilter = filter === "All" || member.status === filter;
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full w-full lg:col-span-2 rounded-2xl bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-stone-900">
          Team Collaboration
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 h-5" />
            <input
              type="text"
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full max-w-[120px] sm:max-w-[150px]"
              aria-label="Search team members"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Filter by status"
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Idle">Idle</option>
          </select>
        </div>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        role="list"
      >
        <AnimatePresence>
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300"
              role="listitem"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className="w-8 h-8 sm:w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
                  aria-label={`Avatar for ${member.name}`}
                >
                  <span className="text-white text-sm sm:text-base font-medium">
                    {member.initials}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base sm:text-lg text-gray-800">
                      {member.name}
                    </h2>
                    <span
                      className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
                        member.status === "Completed"
                          ? "bg-green-100 text-green-600"
                          : member.status === "In Progress"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Working on: {member.currentTask}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${member.completionPercentage}%` }}
                      transition={{ duration: 0.5 }}
                      aria-label={`Task completion: ${member.completionPercentage}%`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {member.completionPercentage}% Complete
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamCollaboration;
