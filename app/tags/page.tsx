"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, Tag as TagIcon, Trash2, X } from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

type TagItem = { id: string; name: string; color: string };

const PALETTE = ["#0f9d6b", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#e8a33d", "#64748b"];

export default function TagsPage() {
  const { selectedWorkspace } = useWorkspace();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tags?workspaceId=${selectedWorkspace}`);
      if (!res.ok) throw new Error();
      setTags(await res.json());
      setError("");
    } catch {
      setError("Couldn't load tags.");
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createTag(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWorkspace) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), color, workspaceId: selectedWorkspace }),
    });
    setBusy(false);
    if (res.status === 409) return setError("A tag with that name already exists.");
    if (!res.ok) return setError("Couldn't create the tag.");
    setName("");
    await load();
  }

  async function saveName(tag: TagItem) {
    const next = editName.trim();
    if (!next || next === tag.name) return setEditingId(null);
    const res = await fetch(`/api/tags/${tag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: next }),
    });
    if (!res.ok) {
      setError(res.status === 409 ? "A tag with that name already exists." : "Couldn't rename the tag.");
    }
    setEditingId(null);
    await load();
  }

  async function deleteTag(tag: TagItem) {
    if (!window.confirm(`Delete the tag "${tag.name}"? It will be removed from its tasks.`)) return;
    const res = await fetch(`/api/tags/${tag.id}`, { method: "DELETE" });
    if (!res.ok) setError("Couldn't delete the tag.");
    await load();
  }

  return (
    <div className="flex min-h-screen bg-white p-3">
      <div>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <div className="flex-1 space-y-6 rounded-2xl bg-[#f7f7f7] p-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Tags</h1>
            <p className="mt-1 text-gray-400">
              Label tasks in this workspace so they&apos;re easy to filter.
            </p>
          </div>

          <form
            onSubmit={createTag}
            className="flex flex-wrap items-end gap-4 rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="min-w-48 flex-1">
              <label htmlFor="tag-name" className="mb-1.5 block text-sm font-medium">
                New tag
              </label>
              <input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="e.g. Urgent"
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Color</legend>
              <div className="flex h-10 items-center gap-1.5">
                {PALETTE.map((c) => (
                  <label key={c} className="cursor-pointer">
                    <input
                      type="radio"
                      name="tag-color"
                      value={c}
                      checked={color === c}
                      onChange={() => setColor(c)}
                      className="peer sr-only"
                    />
                    <span
                      className="block size-6 rounded-full ring-offset-2 peer-checked:ring-2 peer-focus-visible:ring-2"
                      style={{ backgroundColor: c, ["--tw-ring-color" as string]: c }}
                      title={c}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={busy || !name.trim() || !selectedWorkspace}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add tag
            </button>
          </form>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {loading && tags.length === 0 ? (
            <p className="text-sm text-gray-400">Loading tags…</p>
          ) : tags.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <TagIcon className="mb-3 h-8 w-8 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-900">No tags yet</h2>
              <p className="mt-1 text-sm text-gray-500">Add your first tag above.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
              {tags.map((tag) => (
                <li key={tag.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                  {editingId === tag.id ? (
                    <>
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void saveName(tag);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        maxLength={50}
                        aria-label="Tag name"
                        className="h-9 flex-1 rounded-lg border border-gray-200 px-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                      <button onClick={() => saveName(tag)} aria-label="Save name" className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} aria-label="Cancel" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-sm font-medium text-gray-900">{tag.name}</span>
                      <button
                        onClick={() => {
                          setEditingId(tag.id);
                          setEditName(tag.name);
                        }}
                        aria-label={`Rename ${tag.name}`}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTag(tag)}
                        aria-label={`Delete ${tag.name}`}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
