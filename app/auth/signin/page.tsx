import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { enabledOAuthProviders } from "@/lib/auth/options";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New to Taskito?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-brand-strong underline underline-offset-4 dark:text-emerald-300"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <SignInForm providers={enabledOAuthProviders} />
      </Suspense>
    </AuthShell>
  );
}
