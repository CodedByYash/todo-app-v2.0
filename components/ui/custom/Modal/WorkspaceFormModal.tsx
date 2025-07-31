"use client";

import { useWorkspace } from "@/components/WorkspaceProvider";
import { useSession } from "next-auth/react";
import React, { FormEvent, useEffect, useState } from "react";
import { useTheme } from "../ThemeProvider";
import Modal from "@/components/Modal";
import { FolderKanban, PlusCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import EnhancedSelect from "../enhancedSelect";

interface WorkspaceFormProps {
  onClose: () => void;
  isOpen: boolean;
}

interface TagOption {
  value: string;
  label: string;
}

const WorkspaceFormModal = ({ onClose, isOpen }: WorkspaceFormProps) => {
  const { data: session, status } = useSession();
  const { setSelectedWorkspace } = useWorkspace();
  const {
    textPrimary,
    textSecondary,
    inputBg,
    inputBorder,
    buttonGradient,
    cardBg,
  } = useTheme();
  const [formData, setFormData] = useState({
    workspacename: "",
    description: "",
    imageUrl: "",
    type: "PERSONAL",
    workspaceSize: 1,
    organizationName: "",
    organizationDomain: "",
    isPro: false,
    subscriptionEndsAt: "",
    ownerId: session?.user?.id || "",
    tagIds: [] as string[],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tags, setTags] = useState<TagOption[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (status === "loading" || !isOpen) return;
    if (!session) onClose();
  }, [session, status, isOpen, onClose]);

  const handleAddTag = async () => {
    if (!newTag.trim() || !formData.ownerId) return;
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTag,
          workspaceId: null,
          color: "#3b82f6",
        }), // Will update workspaceId after creation
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
        setError("Failed to create tag");
      }
    } catch (err) {
      setError("Error creating tag");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subscriptionEndsAt: formData.subscriptionEndsAt
            ? new Date(formData.subscriptionEndsAt).toISOString()
            : null,
        }),
      });

      if (response.ok) {
        const workspace = await response.json();
        setSuccess("Workspace created successfully!");
        setSelectedWorkspace(workspace.id);
        // Update tags with new workspaceId
        for (const tagId of formData.tagIds) {
          await fetch(`/api/tags/${tagId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workspaceId: workspace.id }),
          });
        }
        setTimeout(onClose, 1000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create workspaces");
      }
    } catch (error) {
      setError("An error occurred while creating the workspace");
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Create Workspace Modal">
      <div className={`${cardBg} p-6 rounded-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`${textPrimary} text-2xl font-bold flex items-center`}>
            <FolderKanban className="w-6 h-6 text-emerald-500 mr-2" /> Create
            Workspace
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
              htmlFor="workspacename"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Workspace Name
            </label>
            <input
              id="workspacename"
              type="text"
              value={formData.workspacename}
              onChange={(e) =>
                setFormData({ ...formData, workspacename: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter workspace name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
            >
              <option value="PERSONAL">Personal</option>
              <option value="PROFESSIONAL">Professional</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="description"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter workspace description"
              rows={4}
            />
          </div>
          <div>
            <label
              htmlFor="imageUrl"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter image URL (optional)"
            />
          </div>
          <div>
            <label
              htmlFor="organizationName"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Organization Name
            </label>
            <input
              id="organizationName"
              type="text"
              value={formData.organizationName}
              onChange={(e) =>
                setFormData({ ...formData, organizationName: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter organization name (optional)"
            />
          </div>
          <div>
            <label
              htmlFor="workspaceSize"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Workspace Size
            </label>
            <input
              id="workspaceSize"
              type="number"
              value={formData.workspaceSize}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workspaceSize: parseInt(e.target.value) || 1,
                })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter workspace size"
              min={1}
            />
          </div>
          <div>
            <label
              htmlFor="organizationDomain"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Organization Domain
            </label>
            <input
              id="organizationDomain"
              type="text"
              value={formData.organizationDomain}
              onChange={(e) =>
                setFormData({ ...formData, organizationDomain: e.target.value })
              }
              className={`${inputBg} ${inputBorder} w-full rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500`}
              placeholder="Enter organization domain (optional)"
            />
          </div>
          <div>
            <label
              htmlFor="isPro"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Pro Subscription
            </label>
            <input
              id="isPro"
              type="checkbox"
              checked={formData.isPro}
              onChange={(e) =>
                setFormData({ ...formData, isPro: e.target.checked })
              }
              className="rounded focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label
              htmlFor="subscriptionEndsAt"
              className={`${textSecondary} block text-sm font-medium mb-1`}
            >
              Subscription Ends At
            </label>
            <input
              id="subscriptionEndsAt"
              type="datetime-local"
              value={formData.subscriptionEndsAt}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionEndsAt: e.target.value })
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
          <div className="flex space-x-4">
            <motion.button
              type="submit"
              className={`flex-1 py-3 bg-gradient-to-r ${buttonGradient} text-white rounded-2xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Create workspace"
            >
              Create Workspace
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

export default WorkspaceFormModal;
