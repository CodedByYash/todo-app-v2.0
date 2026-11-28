"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, User, Users } from "lucide-react";
import { Logo } from "@/components/auth/Logo";

type WorkspaceType = "PERSONAL" | "PROFESSIONAL";

const options: { value: WorkspaceType; title: string; body: string; icon: typeof User }[] = [
  { value: "PERSONAL", title: "Just me", body: "Your own tasks, tags and reminders.", icon: User },
  { value: "PROFESSIONAL", title: "With a team", body: "Share tasks and invite teammates later.", icon: Users },
];

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const firstName = session?.user?.name?.split(" ")[0];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<WorkspaceType>("PERSONAL");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const workspaceName =
    name || (firstName ? `${firstName}'s workspace` : "My workspace");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspacename: workspaceName.trim(),
          description: description.trim() || undefined,
          type,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(
          typeof body?.error === "string" ? body.error : "Couldn't create your workspace.",
        );
      }
      // Refresh the session token so the proxy knows onboarding is done.
      await update();
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your workspace.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
      <Logo />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {firstName ? `Welcome, ${firstName}` : "Welcome to Taskito"}
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-300">
          Create your first workspace. Tasks and tags live inside it.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">How will you use it?</legend>
            <div className="grid grid-cols-2 gap-3">
              {options.map(({ value, title, body, icon: Icon }) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-xl border p-3.5 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${
                    type === value
                      ? "border-brand bg-emerald-50 dark:bg-emerald-400/10"
                      : "border-line bg-white hover:bg-stone-50 dark:border-white/15 dark:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className="sr-only"
                  />
                  <Icon className="mb-2 size-5 text-brand-strong dark:text-emerald-300" aria-hidden />
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{body}</div>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="ws-name" className="mb-1.5 block text-sm font-medium">
              Workspace name
            </label>
            <input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={workspaceName}
              maxLength={255}
              className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/20 dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <div>
            <label htmlFor="ws-desc" className="mb-1.5 block text-sm font-medium">
              Description <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/20 dark:border-white/15 dark:bg-white/5"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-70"
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {submitting ? "Creating…" : "Create workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
