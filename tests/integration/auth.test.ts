import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/getUser", () => ({ default: vi.fn() }));

import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/prisma";
import { POST as signup } from "@/app/api/auth/signup/route";
import { cleanupUsers, hasDb, jsonRequest, makeUser, testEmail } from "./helpers";

type Authorize = (c: Record<string, string> | undefined, req?: unknown) => Promise<{ id: string; email: string } | null>;
const credentials = authOptions.providers.find((p) => p.id === "credentials") as unknown as {
  options: { authorize: Authorize };
};
const authorize: Authorize = (c) => credentials.options.authorize(c, {});

describe.skipIf(!hasDb)("auth (database)", () => {
  beforeAll(() => cleanupUsers());
  afterAll(async () => {
    await cleanupUsers();
    await prisma.$disconnect();
  });

  describe("POST /api/auth/signup", () => {
    it("creates a user from just email + password, with preferences and a hashed password", async () => {
      const email = testEmail("signup");
      const res = await signup(jsonRequest("/api/auth/signup", "POST", { email, password: "Password123!" }));
      expect(res.status).toBe(201);

      const user = await prisma.user.findUnique({ where: { email }, include: { userPreferences: true } });
      expect(user?.password).toMatch(/^\$2[aby]\$/);
      expect(user?.password).not.toContain("Password123!");
      expect(user?.userPreferences).not.toBeNull();
      expect(user?.onboardingCompleted).toBe(false);
      expect(user?.name).toBeTruthy();
    });

    it("rejects a duplicate email regardless of case", async () => {
      const email = testEmail("dup");
      await signup(jsonRequest("/api/auth/signup", "POST", { email, password: "Password123!" }));
      const again = await signup(
        jsonRequest("/api/auth/signup", "POST", { email: email.toUpperCase(), password: "Password123!" }),
      );
      expect(again.status).toBe(409);
    });

    it("validates input and malformed bodies", async () => {
      expect((await signup(jsonRequest("/api/auth/signup", "POST", { email: "bad", password: "Password123!" }))).status).toBe(400);
      expect((await signup(jsonRequest("/api/auth/signup", "POST", { email: testEmail("x"), password: "short" }))).status).toBe(400);
      const bad = new Request("http://localhost/api/auth/signup", { method: "POST", body: "{not json" });
      expect((await signup(bad)).status).toBe(400);
    });
  });

  describe("credentials sign-in", () => {
    it("signs in with the right password (email is case-insensitive)", async () => {
      const u = await makeUser("login");
      const ok = await authorize({ email: u.email.toUpperCase(), password: "Password123!" });
      expect(ok?.id).toBe(u.id);
    });

    it("rejects a wrong password, an unknown email and an OAuth-only account", async () => {
      const u = await makeUser("login2");
      await expect(authorize({ email: u.email, password: "wrong-password" })).rejects.toThrow("Invalid email or password");
      await expect(authorize({ email: testEmail("ghost"), password: "Password123!" })).rejects.toThrow("Invalid email or password");

      const oauthOnly = await prisma.user.create({ data: { email: testEmail("oauthonly"), name: "O" } });
      await expect(authorize({ email: oauthOnly.email, password: "anything-at-all" })).rejects.toThrow("Invalid email or password");
    });
  });

  describe("OAuth sign-in callback", () => {
    const signIn = authOptions.callbacks!.signIn!;
    const account = (provider: string, id: string) =>
      ({ provider, providerAccountId: id, type: "oauth", access_token: "tok" }) as never;

    it("creates a user + linked account on first Google sign-in", async () => {
      const email = testEmail("google");
      const result = await signIn({
        user: { id: "g-1", email, name: "Gina Google", image: "https://img/x.png" },
        account: account("google", `g-${email}`),
        profile: { email_verified: true } as never,
      } as never);
      expect(result).toBe(true);

      const user = await prisma.user.findUnique({ where: { email }, include: { accounts: true, userPreferences: true } });
      expect(user?.name).toBe("Gina Google");
      expect(user?.emailVerified).not.toBeNull();
      expect(user?.accounts).toHaveLength(1);
      expect(user?.userPreferences).not.toBeNull();
    });

    it("links a GitHub sign-in to an existing email/password user instead of failing", async () => {
      const existing = await makeUser("link");
      const result = await signIn({
        user: { id: "gh-1", email: existing.email.toUpperCase(), name: "Octo" },
        account: account("github", `gh-${existing.id}`),
      } as never);
      expect(result).toBe(true);

      expect(await prisma.user.count({ where: { email: existing.email } })).toBe(1);
      const accounts = await prisma.account.findMany({ where: { userId: existing.id } });
      expect(accounts.map((a) => a.provider)).toEqual(["github"]);
    });

    it("is idempotent for repeat sign-ins", async () => {
      const email = testEmail("again");
      const args = {
        user: { id: "x", email, name: "A" },
        account: account("github", `gh-${email}`),
      } as never;
      await signIn(args);
      await signIn(args);
      expect(await prisma.account.count({ where: { providerAccountId: `gh-${email}` } })).toBe(1);
    });

    it("refuses Google accounts with unverified emails, and providers without an email", async () => {
      const unverified = await signIn({
        user: { id: "g-2", email: testEmail("unv"), name: "U" },
        account: account("google", "g-unverified"),
        profile: { email_verified: false } as never,
      } as never);
      expect(unverified).toContain("/auth/error");

      const noEmail = await signIn({
        user: { id: "gh-2", email: null, name: "N" },
        account: account("github", "gh-noemail"),
      } as never);
      expect(noEmail).toContain("NoEmail");
    });
  });

  describe("jwt / session callbacks", () => {
    const { jwt, session } = authOptions.callbacks!;

    it("puts the database id and onboarding state into the token", async () => {
      const u = await makeUser("jwt");
      const token = await jwt!({ token: {}, user: { id: "provider-id", email: u.email } } as never);
      expect(token.id).toBe(u.id);
      expect(token.onboardingCompleted).toBe(false);

      const s = await session!({ session: { user: {} }, token } as never);
      expect((s as { user: { id: string } }).user.id).toBe(u.id);
    });

    it("re-reads onboarding from the DB on update() and ignores client-supplied values", async () => {
      const u = await makeUser("jwt2");
      const token = { id: u.id, onboardingCompleted: false };
      // A malicious client passing { onboardingCompleted: true } must have no effect.
      const forged = await jwt!({ token, trigger: "update", session: { onboardingCompleted: true } } as never);
      expect(forged.onboardingCompleted).toBe(false);

      await prisma.user.update({ where: { id: u.id }, data: { onboardingCompleted: true } });
      const real = await jwt!({ token, trigger: "update" } as never);
      expect(real.onboardingCompleted).toBe(true);
    });
  });
});
