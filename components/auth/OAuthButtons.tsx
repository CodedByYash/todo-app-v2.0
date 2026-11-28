"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Providers = { google: boolean; github: boolean };

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path
      fill="#4285F4"
      d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4.01-3.1Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.87 8.88 4.76 12 4.76Z"
    />
  </svg>
);

const GitHubMark = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

const buttonClass =
  "flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

export function OAuthButtons({
  providers,
  callbackUrl,
  verb,
}: {
  providers: Providers;
  callbackUrl: string;
  /** "Continue" / "Sign up" label prefix. */
  verb: string;
}) {
  const [pending, setPending] = useState<"google" | "github" | null>(null);

  if (!providers.google && !providers.github) return null;

  const start = (provider: "google" | "github") => {
    setPending(provider);
    void signIn(provider, { callbackUrl });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {providers.google && (
          <button
            type="button"
            className={buttonClass}
            disabled={pending !== null}
            onClick={() => start("google")}
          >
            <GoogleMark />
            {pending === "google" ? "Redirecting…" : `${verb} with Google`}
          </button>
        )}
        {providers.github && (
          <button
            type="button"
            className={buttonClass}
            disabled={pending !== null}
            onClick={() => start("github")}
          >
            <GitHubMark />
            {pending === "github" ? "Redirecting…" : `${verb} with GitHub`}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 py-1 text-xs text-stone-500 dark:text-stone-400">
        <span className="h-px flex-1 bg-line dark:bg-white/10" />
        or use your email
        <span className="h-px flex-1 bg-line dark:bg-white/10" />
      </div>
    </div>
  );
}
