"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { signupSchema } from "@/lib/schema/schema";
import { safeCallbackUrl } from "@/lib/auth/redirect";
import { Field } from "@/components/auth/Field";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

type Errors = { email?: string; password?: string; form?: string };

export function SignUpForm({
  providers,
}: {
  providers: { google: boolean; github: boolean };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors;
      setErrors({ email: fields.email?.[0], password: fields.password?.[0] });
      return;
    }

    setErrors({});
    setExists(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.status === 409) {
        setExists(true);
        setErrors({ email: "An account with this email already exists." });
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { fieldErrors?: Record<string, string[]> } | string;
        } | null;
        const fe = typeof body?.error === "object" ? body.error.fieldErrors : undefined;
        setErrors({
          email: fe?.email?.[0],
          password: fe?.password?.[0],
          form: fe ? undefined : "Something went wrong. Please try again.",
        });
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (!result || result.error) {
        router.replace("/auth/signin");
        return;
      }
      // New accounts land on onboarding; the proxy sends them there.
      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setErrors({ form: "Network error. Check your connection and try again." });
      setLoading(false);
    }
  }

  return (
    <>
      <OAuthButtons providers={providers} callbackUrl={callbackUrl} verb="Sign up" />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
          >
            {errors.form}
          </p>
        )}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={setEmail}
          error={errors.email}
          disabled={loading}
        />
        {exists && (
          <p className="-mt-2 text-sm">
            <Link href="/auth/signin" className="font-medium text-brand-strong underline underline-offset-4 dark:text-emerald-300">
              Sign in instead
            </Link>
          </p>
        )}
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          hint="At least 8 characters."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-70"
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </>
  );
}
