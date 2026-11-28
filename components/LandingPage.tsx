import Link from "next/link";
import { BarChart3, CalendarDays, Tags, Users } from "lucide-react";
import { Logo } from "@/components/auth/Logo";
import { TaskPreview } from "@/components/auth/TaskPreview";

const features = [
  {
    icon: Users,
    title: "Workspaces for every context",
    body: "Keep personal errands and team projects apart, and invite teammates when you need to.",
  },
  {
    icon: Tags,
    title: "Priorities and tags",
    body: "Mark what matters, label the rest, and filter down to the work in front of you.",
  },
  {
    icon: CalendarDays,
    title: "Due dates and reminders",
    body: "See the week on a calendar and get a nudge before something slips.",
  },
  {
    icon: BarChart3,
    title: "Progress you can see",
    body: "Daily progress and a weekly chart show how much you actually finished.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink dark:bg-[#0e1512] dark:text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/auth/signin"
            className="rounded-lg px-3 py-2 text-stone-600 transition hover:text-ink dark:text-stone-300 dark:hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-ink px-4 py-2 text-white transition hover:bg-black dark:bg-white dark:text-ink dark:hover:bg-stone-200"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1fr_1.1fr] lg:pt-20">
        <div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            A task list that stays out of your way.
          </h1>
          <p className="mt-6 max-w-md text-lg text-stone-600 dark:text-stone-300">
            Taskito keeps your tasks, due dates and reminders in one calm place,
            for you or your whole team.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex h-12 items-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Create a free account
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex h-12 items-center rounded-xl border border-line px-6 text-sm font-medium transition hover:bg-white dark:border-white/15 dark:hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="relative h-[26rem] overflow-hidden rounded-3xl bg-[#e9efe8] dark:bg-[#0a100d]">
          <TaskPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
          Everything you need to get through the week
        </h2>
        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-brand-strong dark:text-emerald-300" aria-hidden />
              <div>
                <dt className="font-semibold">{title}</dt>
                <dd className="mt-1 max-w-sm text-stone-600 dark:text-stone-300">{body}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-stone-500 dark:border-white/10 dark:text-stone-400">
        Taskito
      </footer>
    </div>
  );
}
