"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

const LandingPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  if (session) {
    redirect(session.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-300 to-stone-300 flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          Welcome to Taskito
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
          Organize tasks, collaborate with your team, and track progress
          seamlessly with Taskito.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
            aria-label="Sign up for Taskito"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signin"
            className="bg-white border border-gray-300 text-gray-900 py-2 sm:py-3 px-4 sm:px-6 rounded-2xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
            aria-label="Sign in to Taskito"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
