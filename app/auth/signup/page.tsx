import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { enabledOAuthProviders } from "@/lib/auth/options";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start. It takes about ten seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-brand-strong underline underline-offset-4 dark:text-emerald-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <Suspense>
        <SignUpForm providers={enabledOAuthProviders} />
      </Suspense>
    </AuthShell>
  );
}
