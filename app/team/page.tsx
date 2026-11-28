"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, UserMinus, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import Sidebar from "@/components/ui/custom/Sidebar/Sidebar";
import DashboardHeader from "@/components/ui/custom/header";

type Role = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
type Member = {
  id: string;
  role: Role;
  userId: string;
  user: { id: string; name: string | null; email: string; profilePicture: string | null };
};
type FoundUser = { id: string; name: string | null; email: string };

const initials = (m: { name: string | null; email: string }) =>
  (m.name || m.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function TeamPage() {
  const { data: session } = useSession();
  const { selectedWorkspace, workspaces } = useWorkspace();
  const workspace = workspaces.find((w) => w.id === selectedWorkspace);

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoundUser[]>([]);
  const [searching, setSearching] = useState(false);

  const me = members.find((m) => m.userId === session?.user?.id);
  const canManage = me?.role === "OWNER" || me?.role === "ADMIN";

  const load = useCallback(async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${selectedWorkspace}/members`);
      if (!res.ok) throw new Error();
      setMembers(await res.json());
      setError("");
    } catch {
      setError("Couldn't load team members.");
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    void load();
  }, [load]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/user/search?query=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error();
      const data: { existingUser: FoundUser[] } = await res.json();
      const memberIds = new Set(members.map((m) => m.userId));
      setResults(data.existingUser.filter((u) => !memberIds.has(u.id)));
      setError("");
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  }

  async function add(userId: string) {
    const res = await fetch(`/api/workspaces/${selectedWorkspace}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: "MEMBER" }),
    });
    if (!res.ok) return setError("Couldn't add that person.");
    setResults((r) => r.filter((u) => u.id !== userId));
    await load();
  }

  async function changeRole(member: Member, role: Role) {
    const res = await fetch(`/api/workspaces/${selectedWorkspace}/members/${member.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) setError("You can't change that role.");
    await load();
  }

  async function remove(member: Member) {
    const self = member.userId === session?.user?.id;
    const label = self ? "leave this workspace" : `remove ${member.user.name || member.user.email}`;
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    const res = await fetch(`/api/workspaces/${selectedWorkspace}/members/${member.userId}`, {
      method: "DELETE",
    });
    if (!res.ok) return setError("You can't remove this member.");
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
            <h1 className="text-3xl font-semibold text-gray-900">Team</h1>
            <p className="mt-1 text-gray-400">
              {workspace ? `People in ${workspace.workspacename}.` : "Select a workspace to see its people."}
            </p>
          </div>

          {canManage && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <form onSubmit={search} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Find people by name or email"
                    placeholder="Find people by name or email"
                    className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !query.trim()}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {searching && <Loader2 className="h-4 w-4 animate-spin" />}
                  Search
                </button>
              </form>
              {results.length > 0 && (
                <ul className="mt-4 divide-y divide-gray-100">
                  {results.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 py-2.5">
                      <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {initials(u)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">{u.name || u.email}</span>
                        <span className="block truncate text-xs text-gray-500">{u.email}</span>
                      </span>
                      <button
                        onClick={() => add(u.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <UserPlus className="h-4 w-4" /> Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {loading && members.length === 0 ? (
            <p className="text-sm text-gray-400">Loading team…</p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
              {members.map((m) => {
                const isSelf = m.userId === session?.user?.id;
                const editable =
                  canManage && !isSelf && m.role !== "OWNER" && (me?.role === "OWNER" || m.role !== "ADMIN");
                return (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      {initials(m.user)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900">
                        {m.user.name || m.user.email}
                        {isSelf && <span className="ml-1.5 text-xs font-normal text-gray-400">(you)</span>}
                      </span>
                      <span className="block truncate text-xs text-gray-500">{m.user.email}</span>
                    </span>
                    {editable ? (
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m, e.target.value as Role)}
                        aria-label={`Role for ${m.user.name || m.user.email}`}
                        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm"
                      >
                        {me?.role === "OWNER" && <option value="ADMIN">Admin</option>}
                        <option value="MEMBER">Member</option>
                        <option value="GUEST">Guest</option>
                      </select>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                        {m.role.toLowerCase()}
                      </span>
                    )}
                    {((editable && canManage) || (isSelf && m.role !== "OWNER")) && (
                      <button
                        onClick={() => remove(m)}
                        aria-label={isSelf ? "Leave workspace" : `Remove ${m.user.name || m.user.email}`}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
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
