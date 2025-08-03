"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useWorkspace, Workspace } from "@/components/WorkspaceProvider";
import { useTheme } from "@/components/ui/custom/ThemeProvider";
import { CheckCircle2, X, PlusCircle } from "lucide-react";
import Modal from "@/components/Modal";
import EnhancedSelect from "../enhancedSelect";
import { z } from "zod";

interface TagOption {
  value: string;
  label: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskFormModal = ({ isOpen, onClose }: TaskFormModalProps) => {
  const { data: session, status } = useSession();
  const { selectedWorkspace, workspaces } = useWorkspace();
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
    completed: false,
    priority: "no_priority",
    dueDate: "",
    tagIds: [] as string[],
    workspaceId: selectedWorkspace || "",
    userId: session?.user?.id || "",
  });
  const [tags, setTags] = useState<TagOption[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "loading" || !isOpen) return;
    if (!session) {
      onClose();
      return;
    }

    setFormData((prev) => ({
      ...prev,
      userId: session.user.id,
      workspaceId: selectedWorkspace || prev.workspaceId,
    }));

    const fetchTags = async () => {
      if (!selectedWorkspace) return;
      try {
        const response = await fetch(
          `/api/tags?workspaceId=${selectedWorkspace}`
        );
        if (response.ok) {
          const data = await response.json();
          setTags(
            data.map((tag: { id: string; name: string }) => ({
              value: tag.id,
              label: tag.name,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError("Failed to load tags");
      }
    };
    fetchTags();
  }, [session, status, selectedWorkspace, isOpen, onClose]);

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedWorkspace) {
      setError("Tag name and workspace are required");
      return;
    }
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
        setFormData({
          ...formData,
          tagIds: [...formData.tagIds, newTagData.id],
        });
        setNewTag("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create tag");
      }
    } catch (err) {
      console.log(err);
      setError("Error creating tag");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate || undefined, // Convert empty string to undefined
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess("Task created successfully!");
        setTimeout(onClose, 1000);
      } else {
        const data = await response.json();
        setError(
          data.error?.map((e: z.ZodIssue) => e.message).join(", ") ||
            "Failed to create task"
        );
      }
    } catch (err) {
      setError("An error occurred while creating the task");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Create Task Modal">
      <div className={`${cardBg} p-6 rounded-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`${textPrimary} text-2xl font-bold flex items-center`}>
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-2" /> Create
            Task
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
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <label
              htmlFor="completed"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Completed
            </label>
            <input
              id="completed"
              type="checkbox"
              checked={formData.completed}
              onChange={(e) =>
                setFormData({ ...formData, completed: e.target.checked })
              }
              className="rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label
              htmlFor="priority"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
            >
              <option value="no_priority">No Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="dueDate"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Due Date and Time
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
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
              value={formData.tagIds}
              onChange={(value) =>
                setFormData({ ...formData, tagIds: value as string[] })
              }
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
          <div>
            <label
              htmlFor="workspaceId"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Workspace
            </label>
            <EnhancedSelect
              options={workspaces.map((ws: Workspace) => ({
                value: ws.id,
                label: ws.workspacename,
              }))}
              value={formData.workspaceId}
              onChange={(value) =>
                setFormData({ ...formData, workspaceId: value as string })
              }
              placeholder="Select workspace"
              theme={{
                bg: inputBg,
                text: textPrimary,
                border: inputBorder,
                hover: "hover:bg-emerald-50",
              }}
            />
          </div>
          <div className="flex space-x-4">
            <motion.button
              type="submit"
              className={`flex-1 py-3 bg-gradient-to-r ${buttonGradient} text-white rounded-2xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create task"
            >
              Create Task
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

export default TaskFormModal;
