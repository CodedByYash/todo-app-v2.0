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
          `/api/tags?workspaceId=${selectedWorkspace}`,
        );
        if (response.ok) {
          const data = await response.json();
          setTags(
            data.map((tag: { id: string; name: string }) => ({
              value: tag.id,
              label: tag.name,
            })),
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
            "Failed to create task",
        );
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred while creating the task");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Create Task Modal">
      <div className={`${cardBg} rounded-2xl p-6`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`${textPrimary} flex items-center text-2xl font-bold`}>
            <CheckCircle2 className="mr-2 h-6 w-6 text-emerald-500" /> Create
            Task
          </h2>
          <button
            onClick={onClose}
            className="rounded-2xl p-2 hover:bg-gray-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-red-500"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-green-500"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className={`${textSecondary} mb-1 block text-sm font-medium`}
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
              className={`${textSecondary} mb-1 block text-sm font-medium`}
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
              className={`${textSecondary} mb-1 block text-sm font-medium`}
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
              className={`${textSecondary} mb-1 block text-sm font-medium`}
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
              className={`${textSecondary} mb-1 block text-sm font-medium`}
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
            <div className="mt-2 flex">
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
                className={`ml-2 bg-gradient-to-r p-3 ${buttonGradient} rounded-2xl text-white hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add new tag"
              >
                <PlusCircle className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
          <div>
            <label
              htmlFor="workspaceId"
              className={`${textSecondary} mb-1 block text-sm font-medium`}
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
              className={`flex-1 bg-gradient-to-r py-3 ${buttonGradient} rounded-2xl text-white transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create task"
            >
              Create Task
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-2xl bg-gray-200 py-3 text-gray-700 transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
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
