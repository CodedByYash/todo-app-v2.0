import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/auth/Logo";

export const metadata: Metadata = { title: "Sign-in problem" };

const messages: Record<string, { title: string; body: string }> = {
  NoEmail: {
    title: "We couldn't read your email",
    body: "Your provider didn't share an email address. Make sure it's public or verified, or sign up with email instead.",
  },
  EmailNotVerified: {
    title: "Verify your email first",
    body: "Your Google account's email isn't verified. Verify it with Google, then try again.",
  },
  OAuthAccountNotLinked: {
    title: "That email is already registered",
    body: "Sign in with the method you used when you created the account.",
  },
  AccessDenied: {
    title: "Access denied",
    body: "You cancelled the sign-in or the provider refused it. You can try again.",
  },
  Configuration: {
    title: "Sign-in isn't set up correctly",
    body: "The server is missing authentication settings. If this is your deployment, check the environment variables.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = (error && messages[error]) || {
    title: "Something went wrong signing you in",
    body: "Please try again. If it keeps happening, use email and password instead.",
  };

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
      <Logo />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <h1 className="text-2xl font-semibold tracking-tight">{message.title}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-300">{message.body}</p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
