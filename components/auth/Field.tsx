"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type FieldProps = {
  label: string;
  name: string;
  type?: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  hint?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  trailing?: React.ReactNode;
};

export function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  hint,
  autoFocus,
  disabled,
  trailing,
}: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {trailing}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-stone-400 transition focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/20 disabled:opacity-60 dark:bg-white/5 dark:text-white ${
            error
              ? "border-red-500"
              : "border-line dark:border-white/15"
          } ${isPassword ? "pr-11" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-500 hover:text-ink dark:hover:text-white"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
