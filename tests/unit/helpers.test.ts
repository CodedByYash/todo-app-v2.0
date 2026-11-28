import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "@/lib/auth/redirect";
import { nameFromEmail, normalizeEmail } from "@/lib/auth/users";

describe("safeCallbackUrl", () => {
  it("keeps same-site paths", () => {
    expect(safeCallbackUrl("/tasks?x=1")).toBe("/tasks?x=1");
  });
  it("rejects open-redirect attempts", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", ""]) {
      expect(safeCallbackUrl(bad)).toBe("/dashboard");
    }
    expect(safeCallbackUrl(null)).toBe("/dashboard");
  });
});

describe("user helpers", () => {
  it("normalizes email", () => {
    expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
  });
  it("derives a display name from the email", () => {
    expect(nameFromEmail("jane.doe@x.com")).toBe("Jane Doe");
    expect(nameFromEmail("a_b-c@x.com")).toBe("A B C");
  });
});
