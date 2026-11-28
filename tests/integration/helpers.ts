import { randomUUID } from "node:crypto";
import { vi } from "vitest";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { createUser } from "@/lib/auth/users";

export const hasDb = Boolean(process.env.DATABASE_URL);

/** Makes the route handlers see this user as signed in (null = signed out). */
export function actAs(userId: string | null) {
  vi.mocked(getUser).mockResolvedValue(
    userId ? ({ id: userId, onboardingCompleted: true } as never) : null,
  );
}

export const testEmail = (label: string) =>
  `${label}-${randomUUID().slice(0, 8)}@test.taskito.dev`;

export async function makeUser(label: string, password = "Password123!") {
  return createUser({ email: testEmail(label), password, name: label });
}

/** A workspace owned by `owner`, with matching OWNER membership. */
export async function makeWorkspace(ownerId: string, name = "WS") {
  return prisma.workspace.create({
    data: {
      workspacename: name,
      ownerId,
      members: { create: { userId: ownerId, role: "OWNER" } },
    },
  });
}

export const addMember = (userId: string, workspaceId: string, role: "ADMIN" | "MEMBER" | "GUEST") =>
  prisma.workspaceMember.create({ data: { userId, workspaceId, role } });

export function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const params = <T extends Record<string, string>>(p: T) => ({
  params: Promise.resolve(p),
});

export async function cleanupUsers(emailSuffix = "@test.taskito.dev") {
  await prisma.user.deleteMany({ where: { email: { endsWith: emailSuffix } } });
}
