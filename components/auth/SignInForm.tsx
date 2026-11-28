"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { signinSchema } from "@/lib/schema/schema";
import { safeCallbackUrl } from "@/lib/auth/redirect";
import { Field } from "@/components/auth/Field";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

type Errors = { email?: string; password?: string; form?: string };

const oauthErrors: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already registered. Sign in with the method you used first.",
  AccessDenied: "Access was denied. Please try again.",
};

export function SignInForm({
  providers,
}: {
  providers: { google: boolean; github: boolean };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const urlError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>(
    urlError ? { form: oauthErrors[urlError] ?? "Sign in failed. Please try again." } : {},
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signinSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fields = z.flattenError(parsed.error).fieldErrors;
      setErrors({ email: fields.email?.[0], password: fields.password?.[0] });
      return;
    }

    setErrors({});
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (!result || result.error) {
      setLoading(false);
      setErrors({ form: "Incorrect email or password." });
      return;
    }
    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <>
      <OAuthButtons providers={providers} callbackUrl={callbackUrl} verb="Continue" />
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
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:opacity-70"
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </>
  );
}
