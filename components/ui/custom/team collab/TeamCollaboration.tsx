"use client";

import { motion } from "motion/react";
import { Users, UserPlus } from "lucide-react";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
}

interface TeamCollaborationProps {
  members: TeamMember[];
}

const avatarColors = [
  "from-emerald-400 to-emerald-600",
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-cyan-400 to-cyan-600",
];

const getInitials = (name: string | null, email: string) => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
};

const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ members }) => {
  return (
    <div className="col-span-2 flex h-full min-h-[200px] w-full flex-col rounded-[2rem] bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 shadow sm:min-h-[250px] sm:p-5 md:min-h-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-stone-900 sm:text-xl">
          Team
        </h3>
        <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium text-stone-600">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto rounded-3xl bg-white p-4 shadow-sm">
        {members.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <UserPlus className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No team members yet</p>
          </div>
        ) : (
          <>
            {/* Stacked avatar row */}
            <div className="mb-4 flex items-center">
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} ring-2 ring-white`}
                  >
                    <span className="text-[10px] font-semibold text-white">
                      {getInitials(member.name, member.email)}
                    </span>
                  </motion.div>
                ))}
                {members.length > 5 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
                    +{members.length - 5}
                  </div>
                )}
              </div>
            </div>

            {/* Member list */}
            <div className="space-y-2">
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]}`}
                  >
                    <span className="text-[10px] font-semibold text-white">
                      {getInitials(member.name, member.email)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {member.name || member.username || "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {member.email}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamCollaboration;
