import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";

export const BCRYPT_ROUNDS = 12;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned
    ? cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
    : "New User";
}

type CreateUserInput = {
  email: string;
  name?: string | null;
  password?: string;
  image?: string | null;
  emailVerified?: boolean;
};

/** Creates a user together with its default preferences row. */
export async function createUser(input: CreateUserInput) {
  const email = normalizeEmail(input.email);
  return prisma.user.create({
    data: {
      email,
      name: input.name?.trim() || nameFromEmail(email),
      password: input.password ? await hash(input.password, BCRYPT_ROUNDS) : null,
      profilePicture: input.image ?? null,
      emailVerified: input.emailVerified ? new Date() : null,
      userPreferences: { create: {} },
    },
  });
}
