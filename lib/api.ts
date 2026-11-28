import { NextResponse } from "next/server";
import { z } from "zod";

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const forbidden = (message = "Forbidden") =>
  NextResponse.json({ error: message }, { status: 403 });

export const notFound = (message = "Not found") =>
  NextResponse.json({ error: message }, { status: 404 });

export const badRequest = (error: string | z.ZodError) =>
  NextResponse.json(
    { error: typeof error === "string" ? error : z.flattenError(error) },
    { status: 400 },
  );

export function serverError(label: string, error: unknown) {
  console.error(`[${label}]`, error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Parses a JSON body, returning null when it is missing or malformed. */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** Safe fields of a user that may be sent to other users. Never the password. */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  profilePicture: true,
} as const;
