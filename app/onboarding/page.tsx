"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

interface OnboardingFormProps {
  userId: string;
  userEmail: string;
  userName: string;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({
  userId,
  userName,
}) => {
  const [workspaceName, setWorkspaceName] = useState(
    `${userName}'s Personal Workspace`
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
          userId,
          workspacename: workspaceName,
          description,
          type: "PERSONAL",
        }),
      });

      if (!response.ok) {
        throw new Error(
          (await response.json()).error || "Failed to create workspace"
        );
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace"
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
          className="mt-1 block w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          className="mt-1 block w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Describe your workspace"
          rows={4}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || !workspaceName}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 sm:py-3 px-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        aria-label="Complete onboarding"
      >
        {isSubmitting ? "Creating..." : "Create Workspace"}
      </button>
    </form>
  );
};

const OnboardingPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  if (!session || !session.user.email || !session.user.username) {
    redirect("/auth/signin");
  }

  if (session.user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          Welcome to Taskito
        </h1>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600">
          Let`&apos`s set up your account, {session.user.username || ""}. Create
          your personal workspace to get started.
        </p>
        <OnboardingForm
          userId={session.user.id}
          userEmail={session.user.email}
          userName={session.user.username || ""}
        />
      </div>
    </div>
  );
};

export default OnboardingPage;
