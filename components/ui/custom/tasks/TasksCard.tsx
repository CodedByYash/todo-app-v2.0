import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: string;
  project: string;
  dueDate: string;
}

interface TaskCardProps {
  tasks: Task[];
  toggleTask: (id: number) => void;
  getPriorityColor: (priority: string) => string;
  completionPercentage: number;
}

const TaskCard: React.FC<TaskCardProps> = ({
  tasks,
  toggleTask,
  getPriorityColor,
  completionPercentage,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("high");

  const groupedTasks = tasks.reduce(
    (acc, task) => {
      const key = task.priority;
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const toggleSection = (priority: string) => {
    setExpandedSection(expandedSection === priority ? null : priority);
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-stone-900 sm:text-xl md:text-2xl">
          Today’s Tasks
        </h1>
        <button
          className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-sm text-white hover:from-emerald-600 hover:to-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:px-4 sm:py-2 sm:text-base"
          aria-label="Add new task"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add Task</span>
        </button>
      </div>
      <div className="rounded-2xl bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3">
        <div className="mb-4">
          <h2 className="mb-2 text-lg text-green-500 sm:text-xl">
            Personal Workspace
          </h2>
          <div className="h-2 w-full rounded-full bg-gray-200 sm:h-2.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
              aria-label={`Task completion: ${completionPercentage}%`}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            {completionPercentage}% Complete
          </p>
        </div>
        <div
          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-h-[150px] space-y-3 overflow-y-auto pr-2 sm:max-h-[200px] sm:space-y-4 md:max-h-[300px]"
          role="list"
        >
          {Object.entries(groupedTasks).map(([priority, tasks]) => (
            <div key={priority}>
              <button
                className="flex w-full items-center justify-between py-2 text-left text-base font-medium text-gray-800 sm:text-lg"
                onClick={() => toggleSection(priority)}
                aria-expanded={expandedSection === priority}
                aria-controls={`tasks-${priority}`}
              >
                <span>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}{" "}
                  Priority
                </span>
                <motion.div
                  animate={{ rotate: expandedSection === priority ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSection === priority && (
                  <motion.div
                    id={`tasks-${priority}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
                  >
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl bg-gray-50 p-3 shadow-sm transition-all duration-300 hover:bg-gray-100 sm:p-4 ${
                          task.completed ? "opacity-70" : ""
                        }`}
                        role="listitem"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 sm:h-5 sm:w-5"
                            aria-label={`Toggle completion for ${task.title}`}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div
                                className={`text-base text-gray-800 sm:text-lg ${
                                  task.completed ? "line-through" : ""
                                }`}
                              >
                                {task.title}
                              </div>
                              <span
                                className={`rounded-full px-2 py-1 text-[10px] sm:text-xs ${getPriorityColor(
                                  task.priority,
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-400 sm:text-sm">
                                {task.project}
                              </div>
                              <time className="text-xs text-gray-400 sm:text-sm">
                                Due: {task.dueDate}
                              </time>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
