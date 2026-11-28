"use client";

import { useState } from "react";
import { FolderKanban, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWorkspace, type Workspace } from "@/components/WorkspaceProvider";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

const inputClass =
  "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export default function WorkspacePage() {
  const { data: session } = useSession();
  const { workspaces, selectedWorkspace, setSelectedWorkspace, refreshWorkspaces } =
    useWorkspace();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERSONAL" | "PROFESSIONAL">("PERSONAL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspacename: name.trim(),
          description: description.trim() || null,
          type,
        }),
      });
      if (!res.ok) throw new Error("Couldn't create the workspace.");
      const created: Workspace = await res.json();
      await refreshWorkspaces(created.id);
      setName("");
      setDescription("");
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the workspace.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteWorkspace(ws: Workspace) {
    if (!window.confirm(`Delete "${ws.workspacename}" and all of its tasks? This can't be undone.`)) {
      return;
    }
    const res = await fetch(`/api/workspaces/${ws.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Couldn't delete the workspace.");
      return;
    }
    await refreshWorkspaces();
  }

  return (
    <div className="flex min-h-screen bg-white p-3">
      <div>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <div className="flex-1 space-y-6 rounded-2xl bg-[#f7f7f7] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Workspaces</h1>
              <p className="mt-1 text-gray-400">
                Keep personal and team work in separate workspaces.
              </p>
            </div>
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                New workspace
              </button>
            )}
          </div>

          {creating && (
            <form
              onSubmit={createWorkspace}
              className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="new-ws-name" className="mb-1.5 block text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="new-ws-name"
                    required
                    autoFocus
                    maxLength={255}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="new-ws-type" className="mb-1.5 block text-sm font-medium">
                    Type
                  </label>
                  <select
                    id="new-ws-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    className={inputClass}
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="PROFESSIONAL">Team</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="new-ws-desc" className="mb-1.5 block text-sm font-medium">
                  Description (optional)
                </label>
                <input
                  id="new-ws-desc"
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create workspace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setError("");
                  }}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!creating && error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
              <FolderKanban className="mb-3 h-8 w-8 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-900">No workspaces yet</h2>
              <p className="mt-1 text-sm text-gray-500">
                Create one to start adding tasks.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((ws) => {
                const active = selectedWorkspace === ws.id;
                const isOwner = ws.ownerId === session?.user?.id;
                return (
                  <li
                    key={ws.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm ${
                      active ? "border-emerald-400 ring-2 ring-emerald-500/20" : "border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedWorkspace(ws.id)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          active ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <FolderKanban className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-gray-900">
                          {ws.workspacename}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {ws.type === "PROFESSIONAL" ? "Team" : "Personal"}
                          {active && " · Active"}
                        </span>
                      </span>
                    </button>
                    {ws.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-500">{ws.description}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {ws.members?.length ?? 1}{" "}
                        {(ws.members?.length ?? 1) === 1 ? "member" : "members"}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => deleteWorkspace(ws)}
                          aria-label={`Delete ${ws.workspacename}`}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
