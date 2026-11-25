"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Calendar,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Create, organize, and complete tasks in seconds",
  },
  {
    icon: Users,
    title: "Team Workspaces",
    desc: "Collaborate with your team in shared workspaces",
  },
  {
    icon: Calendar,
    title: "Smart Calendar",
    desc: "Visualize deadlines and plan your week",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track your productivity with real-time insights",
  },
];

const LandingPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (session) {
    redirect(session.user.onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Taskito</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Zap className="h-3 w-3" />
            Built for productive teams
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-gray-900 sm:text-5xl md:text-6xl">
            Organize your work,{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ship faster
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
            Taskito helps you manage tasks, collaborate with your team, and track
            progress — all in one clean, fast workspace.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
            >
              I already have an account
            </Link>
          </div>
        </motion.div>

        {/* Mock dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200/50">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <div className="ml-4 h-5 w-48 rounded bg-gray-100" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {["12 Total", "8 Done", "3 Active", "1 Overdue"].map(
                (label, i) => (
                  <div
                    key={label}
                    className={`rounded-xl p-4 ${
                      i === 0
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="text-2xl font-bold">
                      {label.split(" ")[0]}
                    </div>
                    <div
                      className={`text-xs ${i === 0 ? "text-emerald-100" : "text-gray-400"}`}
                    >
                      {label.split(" ")[1]} Tasks
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="mt-4 space-y-2">
              {[
                { w: "w-3/4", done: true },
                { w: "w-full", done: false },
                { w: "w-5/6", done: false },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${row.done ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}
                  />
                  <div className={`h-3 ${row.w} rounded bg-gray-200`} />
                  <div className="ml-auto h-5 w-12 rounded-full bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
          {/* Gradient glow behind */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-emerald-100 via-teal-50 to-cyan-100 opacity-60 blur-2xl" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Everything you need to stay on track
          </h2>
          <p className="mt-3 text-gray-500">
            Simple tools, powerful results
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 transition hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <feat.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                {feat.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Taskito — Made with ❤️</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
