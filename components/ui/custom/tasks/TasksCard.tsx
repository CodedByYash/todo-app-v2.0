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

  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.priority;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const toggleSection = (priority: string) => {
    setExpandedSection(expandedSection === priority ? null : priority);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 rounded-2xl overflow-hidden p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl text-stone-900 font-medium">
          Today’s Tasks
        </h1>
        <button
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center space-x-2 text-sm sm:text-base hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Add new task"
        >
          <Plus className="w-4 h-4 sm:w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>
      <div className="rounded-2xl bg-white py-2 sm:py-3 px-3 sm:px-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl text-green-500 mb-2">
            Personal Workspace
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
              aria-label={`Task completion: ${completionPercentage}%`}
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {completionPercentage}% Complete
          </p>
        </div>
        <div
          className="max-h-[150px] sm:max-h-[200px] md:max-h-[300px] overflow-y-auto pr-2 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          role="list"
        >
          {Object.entries(groupedTasks).map(([priority, tasks]) => (
            <div key={priority}>
              <button
                className="flex items-center justify-between w-full text-left text-base sm:text-lg font-medium text-gray-800 py-2"
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
                  <CheckCircle2 className="w-4 h-4 sm:w-5 h-5 text-emerald-500" />
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
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  >
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`p-3 sm:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 shadow-sm ${
                          task.completed ? "opacity-70" : ""
                        }`}
                        role="listitem"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-4 h-4 sm:w-5 h-5 text-emerald-500 focus:ring-emerald-500 rounded"
                            aria-label={`Toggle completion for ${task.title}`}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                              <div
                                className={`text-base sm:text-lg text-gray-800 ${
                                  task.completed ? "line-through" : ""
                                }`}
                              >
                                {task.title}
                              </div>
                              <span
                                className={`rounded-full px-2 py-1 text-[10px] sm:text-xs ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-xs sm:text-sm text-gray-400">
                                {task.project}
                              </div>
                              <time className="text-xs sm:text-sm text-gray-400">
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
