import { motion, AnimatePresence } from "framer-motion";
import { ChangeEvent, useState } from "react";
import { Search } from "lucide-react";

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
    <div className="h-full w-full rounded-2xl bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 sm:p-6 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-stone-900 sm:text-xl md:text-2xl">
          Team Collaboration
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-2 h-4 h-5 w-4 -translate-y-1/2 transform text-gray-500 sm:w-5" />
            <input
              type="text"
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-[120px] rounded-2xl py-1.5 pr-3 pl-8 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:max-w-[150px] sm:py-2 sm:pr-4 sm:pl-10 sm:text-sm"
              aria-label="Search team members"
            />
          </div>
          <select
            value={filter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFilter(
                e.target.value as "All" | "Completed" | "In Progress" | "Idle",
              )
            }
            className="rounded-2xl border border-gray-200 bg-white px-2 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
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
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
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
              className="rounded-2xl bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md sm:p-4"
              role="listitem"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className="flex h-8 h-10 w-8 items-center justify-center rounded-full bg-emerald-500 sm:w-10"
                  aria-label={`Avatar for ${member.name}`}
                >
                  <span className="text-sm font-medium text-white sm:text-base">
                    {member.initials}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base text-gray-800 sm:text-lg">
                      {member.name}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-1 text-xs sm:text-sm ${
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
                  <div className="text-xs text-gray-500 sm:text-sm">
                    Working on: {member.currentTask}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200 sm:h-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
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
