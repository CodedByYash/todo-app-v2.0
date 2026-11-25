"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OnboardingFormProps {
  userName: string;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ userName }) => {
  const { data: session, update: sessionUpdate } = useSession();
  const [workspaceName, setWorkspaceName] = useState(
    `${userName}'s Personal Workspace`,
  );
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspacename: workspaceName,
          description,
          type: "PERSONAL",
        }),
      });

      console.log(response);
      if (!response.ok) {
        throw new Error(
          (await response.json()).error || "Failed to create workspace",
        );
      }
      await sessionUpdate({ onboardingCompleted: true });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label
          htmlFor="workspaceName"
          className="block text-sm font-medium text-gray-700"
        >
          Personal Workspace Name
        </label>
        <input
          id="workspaceName"
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="mt-1 block w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          placeholder="Enter your workspace name"
          aria-required="true"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          placeholder="Describe your workspace"
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || !workspaceName}
        className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-white hover:from-emerald-600 hover:to-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50 sm:py-3"
        aria-label="Complete onboarding"
      >
        {isSubmitting ? "Creating..." : "Create Workspace"}
      </button>
    </form>
  );
};

const OnboardingPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log(session?.user);
  console.log(session?.user.onboardingCompleted);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user?.email || !session?.user?.username) {
      router.replace("/auth/signin");
      return;
    }
    if (session.user.onboardingCompleted) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 px-4 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-6 sm:text-3xl">
          Welcome to Taskito
        </h1>
        <p className="mb-6 text-base text-gray-600 sm:mb-8 sm:text-lg">
          Let&aposs set up your account, {session.user.username || ""}. Create
          your personal workspace to get started.
        </p>
        <OnboardingForm userName={session.user.username || ""} />
      </div>
    </div>
  );
};

export default OnboardingPage;
