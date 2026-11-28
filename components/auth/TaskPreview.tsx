import { Check } from "lucide-react";

/**
 * A quiet, cropped product shot of the task list. Real words only on the
 * rows that tell the story; everything else is calm filler. Purely visual.
 */
const rows = [
  { title: "Send launch notes to the team", done: true, chip: null },
  { title: "Review pull request #42", done: false, chip: "Due today" },
  { title: "Book dentist appointment", done: false, chip: null },
  { title: "Plan next sprint", done: false, chip: "Team" },
  { title: "Update onboarding checklist", done: false, chip: null },
  { title: "Reply to Priya about pricing", done: false, chip: null },
];

export function TaskPreview() {
  return (
    <div
      aria-hidden
      className="absolute inset-y-16 left-14 right-0 overflow-hidden rounded-l-2xl border border-r-0 border-line bg-white shadow-[0_30px_80px_-30px_rgba(20,33,27,0.35)] dark:border-white/10 dark:bg-[#17211c]"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
        <div>
          <div className="text-sm font-semibold">Today</div>
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Personal workspace
          </div>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-brand-strong dark:bg-emerald-400/10 dark:text-emerald-300">
          1 of 6 done
        </div>
      </div>

      <ul className="divide-y divide-line/70 dark:divide-white/5">
        {rows.map((row) => (
          <li key={row.title} className="flex items-center gap-3 px-6 py-3.5">
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                row.done
                  ? "border-brand bg-brand text-white"
                  : "border-stone-300 dark:border-white/25"
              }`}
            >
              {row.done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-sm ${
                row.done ? "text-stone-400 line-through" : ""
              }`}
            >
              {row.title}
            </span>
            {row.chip && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  row.chip === "Due today"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"
                    : "bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300"
                }`}
              >
                {row.chip}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-[#17211c]" />
    </div>
  );
}
