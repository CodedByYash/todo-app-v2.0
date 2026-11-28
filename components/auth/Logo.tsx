import Link from "next/link";
import { Check } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
        <Check className="size-4" strokeWidth={3} aria-hidden />
      </span>
      <span className="text-lg">Taskito</span>
    </Link>
  );
}
