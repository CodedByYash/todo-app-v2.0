import { describe, expect, it } from "vitest";
import {
  createWorkspaceSchema,
  signinSchema,
  signupSchema,
  tasksSchema,
  taskUpdateSchema,
} from "@/lib/schema/schema";

const uuid = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";

describe("signupSchema", () => {
  it("accepts just an email and password (no name/username fields)", () => {
    const r = signupSchema.safeParse({ email: "  Me@Example.com ", password: "longenough" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("Me@Example.com");
  });

  it("rejects bad emails and short or over-long passwords", () => {
    expect(signupSchema.safeParse({ email: "nope", password: "longenough" }).success).toBe(false);
    expect(signupSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(false);
    expect(signupSchema.safeParse({ email: "a@b.co", password: "x".repeat(73) }).success).toBe(false);
  });
});

describe("signinSchema", () => {
  it("requires both fields", () => {
    expect(signinSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(signinSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
    expect(signinSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});

describe("createWorkspaceSchema", () => {
  it("accepts the payload the UI sends and tolerates null / empty optionals", () => {
    const r = createWorkspaceSchema.safeParse({
      workspacename: "Team",
      description: null,
      imageUrl: "",
      type: "PROFESSIONAL",
    });
    expect(r.success).toBe(true);
  });

  it("does not let clients set billing fields", () => {
    const r = createWorkspaceSchema.safeParse({ workspacename: "x", isPro: true });
    expect(r.success).toBe(true);
    if (r.success) expect("isPro" in r.data).toBe(false);
  });
});

describe("task schemas", () => {
  it("accepts a null / missing due date", () => {
    expect(tasksSchema.safeParse({ title: "t", workspaceId: uuid, dueDate: null }).success).toBe(true);
    expect(tasksSchema.safeParse({ title: "t", workspaceId: uuid }).success).toBe(true);
  });

  it("rejects an invalid date and a non-uuid workspace", () => {
    expect(tasksSchema.safeParse({ title: "t", workspaceId: uuid, dueDate: "garbage" }).success).toBe(false);
    expect(tasksSchema.safeParse({ title: "t", workspaceId: "user1" }).success).toBe(false);
  });

  it("allows partial updates", () => {
    expect(taskUpdateSchema.safeParse({ completed: true }).success).toBe(true);
    expect(taskUpdateSchema.safeParse({ dueDate: null }).success).toBe(true);
  });
});
