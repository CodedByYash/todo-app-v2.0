"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useTheme } from "@/components/ui/custom/ThemeProvider";
import { Bell, X, PlusCircle } from "lucide-react";
import Modal from "@/components/Modal";
import EnhancedSelect from "../enhancedSelect";

interface TaskOption {
  value: string;
  label: string;
}

interface TagOption {
  value: string;
  label: string;
}

interface ReminderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReminderFormModal = ({ isOpen, onClose }: ReminderFormModalProps) => {
  const { data: session, status } = useSession();
  const { selectedWorkspace } = useWorkspace();
  const {
    textPrimary,
    textSecondary,
    buttonGradient,
    inputBg,
    inputBorder,
    cardBg,
  } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    reminderDate: "",
    taskId: "",
    userId: session?.user?.id || "",
    workspaceId: selectedWorkspace || "",
  });
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "loading" || !isOpen) return;
    if (!session) onClose();

    const fetchTasksAndTags = async () => {
      if (!selectedWorkspace) return;
      try {
        const [taskResponse, tagResponse] = await Promise.all([
          fetch(`/api/tasks?workspaceId=${selectedWorkspace}`),
          fetch(`/api/tags?workspaceId=${selectedWorkspace}`),
        ]);
        if (taskResponse.ok) {
          const taskData = await taskResponse.json();
          setTasks(
            taskData.map((task: { id: string; title: string }) => ({
              value: task.id,
              label: task.title,
            }))
          );
        }
        if (tagResponse.ok) {
          const tagData = await tagResponse.json();
          setTags(
            tagData.map((tag: { id: string; name: string }) => ({
              value: tag.id,
              label: tag.name,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchTasksAndTags();
  }, [session, status, selectedWorkspace, isOpen, onClose]);

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedWorkspace) return;
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTag,
          workspaceId: selectedWorkspace,
          color: "#3b82f6",
        }),
      });
      if (response.ok) {
        const newTagData = await response.json();
        setTags([...tags, { value: newTagData.id, label: newTagData.name }]);
        setNewTag("");
      } else {
        setError("Failed to create tag");
      }
    } catch (err) {
      setError("Error creating tag");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          reminderDate: formData.reminderDate
            ? new Date(formData.reminderDate).toISOString()
            : null,
        }),
      });

      if (response.ok) {
        setSuccess("Reminder created successfully!");
        setTimeout(onClose, 1000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create reminder");
      }
    } catch (err) {
      setError("An error occurred while creating the reminder");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Create Reminder Modal">
      <div className={`${cardBg} p-6 rounded-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`${textPrimary} text-2xl font-bold flex items-center`}>
            <Bell className="w-6 h-6 text-emerald-500 mr-2" /> Create Reminder
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-500 mb-4"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-green-500 mb-4"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter reminder title"
              required
            />
          </div>
          <div>
            <label
              htmlFor="body"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Description
            </label>
            <textarea
              id="body"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter reminder description"
              rows={4}
            />
          </div>
          <div>
            <label
              htmlFor="reminderDate"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Reminder Date and Time
            </label>
            <input
              id="reminderDate"
              type="datetime-local"
              value={formData.reminderDate}
              onChange={(e) =>
                setFormData({ ...formData, reminderDate: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              required
            />
          </div>
          <div>
            <label
              htmlFor="taskId"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Associated Task (Optional)
            </label>
            <EnhancedSelect
              options={tasks}
              value={formData.taskId}
              onChange={(value) =>
                setFormData({ ...formData, taskId: value as string })
              }
              placeholder="Select a task"
              theme={{
                bg: inputBg,
                text: textPrimary,
                border: inputBorder,
                hover: "hover:bg-emerald-50",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="tags"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Tags
            </label>
            <EnhancedSelect
              options={tags}
              value={[] as string[]} // Reminders don't have tags in schema, included for consistency
              onChange={() => {}} // Disabled since not in schema
              placeholder="Select tags"
              isMulti
              theme={{
                bg: inputBg,
                text: textPrimary,
                border: inputBorder,
                hover: "hover:bg-emerald-50",
              }}
            />
            <div className="flex mt-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
                placeholder="Add new tag"
              />
              <motion.button
                type="button"
                onClick={handleAddTag}
                className={`ml-2 p-3 bg-gradient-to-r ${buttonGradient} text-white rounded-2xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add new tag"
              >
                <PlusCircle className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <div className="flex space-x-4">
            <motion.button
              type="submit"
              className={`flex-1 py-3 bg-gradient-to-r ${buttonGradient} text-white rounded-2xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create reminder"
            >
              Create Reminder
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Cancel"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReminderFormModal;
