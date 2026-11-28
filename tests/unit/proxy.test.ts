import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getToken = vi.fn();
vi.mock("next-auth/jwt", () => ({ getToken: (...a: unknown[]) => getToken(...a) }));

import { proxy } from "@/proxy";

const req = (path: string) => new NextRequest(`http://localhost:3000${path}`);
const loc = (r: Response) => r.headers.get("location");

beforeEach(() => getToken.mockReset());

describe("proxy (route protection)", () => {
  it("returns 401 JSON for protected APIs when signed out", async () => {
    getToken.mockResolvedValue(null);
    const r = await proxy(req("/api/tasks"));
    expect(r.status).toBe(401);
  });

  it("redirects signed-out page visits to sign-in with a callback", async () => {
    getToken.mockResolvedValue(null);
    for (const p of ["/dashboard", "/workspace", "/team", "/tags"]) {
      const r = await proxy(req(p));
      expect(r.status).toBe(307);
      expect(loc(r)).toContain("/auth/signin?callbackUrl=");
    }
  });

  it("leaves the landing page and auth pages open to signed-out users", async () => {
    getToken.mockResolvedValue(null);
    for (const p of ["/", "/auth/signin", "/auth/signup", "/auth/error"]) {
      expect((await proxy(req(p))).status).toBe(200);
    }
  });

  it("sends un-onboarded users to onboarding and blocks other APIs", async () => {
    getToken.mockResolvedValue({ id: "u1", onboardingCompleted: false });
    expect(loc(await proxy(req("/dashboard")))).toContain("/onboarding");
    expect((await proxy(req("/api/tasks"))).status).toBe(403);
    expect((await proxy(req("/api/onboarding"))).status).toBe(200);
    expect((await proxy(req("/api/user/me"))).status).toBe(200);
  });

  it("keeps onboarded users out of onboarding and the auth forms", async () => {
    getToken.mockResolvedValue({ id: "u1", onboardingCompleted: true });
    expect(loc(await proxy(req("/onboarding")))).toContain("/dashboard");
    expect(loc(await proxy(req("/auth/signin")))).toContain("/dashboard");
    expect((await proxy(req("/api/tasks"))).status).toBe(200);
  });
});
