import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/getUser", () => ({ default: vi.fn() }));

import { prisma } from "@/lib/prisma/prisma";
import * as tasksRoute from "@/app/api/tasks/route";
import * as taskRoute from "@/app/api/tasks/[id]/route";
import * as workspacesRoute from "@/app/api/workspaces/route";
import * as workspaceRoute from "@/app/api/workspaces/[workspaceId]/route";
import * as membersRoute from "@/app/api/workspaces/[workspaceId]/members/route";
import * as memberRoute from "@/app/api/workspaces/[workspaceId]/members/[memberId]/route";
import * as tagsRoute from "@/app/api/tags/route";
import * as tagRoute from "@/app/api/tags/[tagId]/route";
import * as commentRoute from "@/app/api/comment/route";
import * as preferencesRoute from "@/app/api/preferences/route";
import * as userRoute from "@/app/api/user/route";
import * as searchRoute from "@/app/api/user/search/route";
import * as dashboardRoute from "@/app/api/dashboard/route";
import * as cronRoute from "@/app/api/cron/reminders/route";
import {
  actAs,
  addMember,
  cleanupUsers,
  hasDb,
  jsonRequest,
  makeUser,
  makeWorkspace,
  params,
} from "./helpers";

type User = Awaited<ReturnType<typeof makeUser>>;
type Workspace = Awaited<ReturnType<typeof makeWorkspace>>;

describe.skipIf(!hasDb)("API routes (database)", () => {
  let owner: User, admin: User, member: User, outsider: User;
  let ws: Workspace, otherWs: Workspace;

  beforeAll(async () => {
    await cleanupUsers();
    [owner, admin, member, outsider] = await Promise.all(
      ["owner", "admin", "member", "outsider"].map((n) => makeUser(n)),
    );
    ws = await makeWorkspace(owner.id, "Main");
    await addMember(admin.id, ws.id, "ADMIN");
    await addMember(member.id, ws.id, "MEMBER");
    otherWs = await makeWorkspace(outsider.id, "Private");
  });
  afterAll(async () => {
    await cleanupUsers();
    await prisma.$disconnect();
  });
  beforeEach(() => actAs(owner.id));

  describe("authentication guard", () => {
    it("every route answers 401 when signed out", async () => {
      actAs(null);
      const calls = [
        tasksRoute.GET(jsonRequest("/api/tasks", "GET")),
        tasksRoute.POST(jsonRequest("/api/tasks", "POST", {})),
        workspacesRoute.GET(),
        tagsRoute.GET(jsonRequest("/api/tags?workspaceId=x", "GET")),
        preferencesRoute.GET(),
        dashboardRoute.GET(jsonRequest("/api/dashboard", "GET")),
        searchRoute.GET(jsonRequest("/api/user/search?query=a", "GET")),
      ];
      for (const res of await Promise.all(calls)) expect(res.status).toBe(401);
    });
  });

  describe("tasks", () => {
    it("lists tasks without a workspaceId (used to return 400/401)", async () => {
      const res = await tasksRoute.GET(jsonRequest("/api/tasks", "GET"));
      expect(res.status).toBe(200);
      expect(Array.isArray(await res.json())).toBe(true);
    });

    it("creates, updates and completes a task with tags", async () => {
      const tag = await prisma.tag.create({ data: { name: "t-ok", color: "#111111", workspaceId: ws.id } });
      const created = await tasksRoute.POST(
        jsonRequest("/api/tasks", "POST", {
          title: "Write tests",
          priority: "high",
          dueDate: null,
          workspaceId: ws.id,
          tagIds: [tag.id],
        }),
      );
      expect(created.status).toBe(201);
      const task = await created.json();
      expect(task.tags).toHaveLength(1);

      const upd = await taskRoute.PUT(
        jsonRequest(`/api/tasks/${task.id}`, "PUT", { completed: true, title: "Wrote tests" }),
        params({ id: task.id }),
      );
      expect(upd.status).toBe(200);
      expect((await upd.json()).completed).toBe(true);

      // Completed tasks drop out of the open-task list.
      const list = await (await tasksRoute.GET(jsonRequest(`/api/tasks?workspaceId=${ws.id}`, "GET"))).json();
      expect(list.find((t: { id: string }) => t.id === task.id)).toBeUndefined();
    });

    it("refuses to create a task in a workspace you don't belong to", async () => {
      const res = await tasksRoute.POST(
        jsonRequest("/api/tasks", "POST", { title: "sneaky", workspaceId: otherWs.id }),
      );
      expect(res.status).toBe(403);
    });

    it("refuses tags that belong to another workspace", async () => {
      const foreign = await prisma.tag.create({ data: { name: "foreign", color: "#222222", workspaceId: otherWs.id } });
      const res = await tasksRoute.POST(
        jsonRequest("/api/tasks", "POST", { title: "x", workspaceId: ws.id, tagIds: [foreign.id] }),
      );
      expect(res.status).toBe(400);
    });

    it("blocks moving a task into someone else's workspace", async () => {
      const task = await prisma.task.create({ data: { title: "mine", userId: owner.id, workspaceId: ws.id } });
      const res = await taskRoute.PUT(
        jsonRequest(`/api/tasks/${task.id}`, "PUT", { workspaceId: otherWs.id }),
        params({ id: task.id }),
      );
      expect(res.status).toBe(403);
      expect((await prisma.task.findUnique({ where: { id: task.id } }))?.workspaceId).toBe(ws.id);
    });

    it("hides tasks from non-members and only lets the creator or owner delete", async () => {
      const task = await prisma.task.create({ data: { title: "shared", userId: member.id, workspaceId: ws.id } });

      actAs(outsider.id);
      expect((await taskRoute.GET(jsonRequest("/x", "GET"), params({ id: task.id }))).status).toBe(404);

      actAs(admin.id); // member of the workspace but neither creator nor owner
      expect((await taskRoute.DELETE(jsonRequest("/x", "DELETE"), params({ id: task.id }))).status).toBe(403);

      actAs(member.id); // creator
      expect((await taskRoute.DELETE(jsonRequest("/x", "DELETE"), params({ id: task.id }))).status).toBe(200);
      expect(await prisma.task.findUnique({ where: { id: task.id } })).toBeNull();
    });
  });

  describe("workspaces & members", () => {
    it("creates a workspace from the shape the UI sends, with an owner membership", async () => {
      const res = await workspacesRoute.POST(
        jsonRequest("/api/workspaces", "POST", {
          workspacename: "Fresh",
          description: null,
          imageUrl: "",
          type: "PROFESSIONAL",
          isPro: true, // must be ignored
        }),
      );
      expect(res.status).toBe(201);
      const created = await res.json();
      const row = await prisma.workspace.findUnique({ where: { id: created.id }, include: { members: true } });
      expect(row?.isPro).toBe(false);
      expect(row?.members[0]).toMatchObject({ userId: owner.id, role: "OWNER" });
    });

    it("never leaks password hashes in workspace, member or comment responses", async () => {
      const task = await prisma.task.create({ data: { title: "c", userId: owner.id, workspaceId: ws.id } });
      await commentRoute.POST(jsonRequest("/api/comment", "POST", { taskId: task.id, content: "hi" }));

      const bodies = await Promise.all([
        workspacesRoute.GET().then((r) => r.text()),
        workspaceRoute.GET(jsonRequest("/x", "GET"), params({ workspaceId: ws.id })).then((r) => r.text()),
        membersRoute.GET(jsonRequest("/x", "GET"), params({ workspaceId: ws.id })).then((r) => r.text()),
        commentRoute.GET(jsonRequest(`/api/comment?taskId=${task.id}`, "GET")).then((r) => r.text()),
        dashboardRoute.GET(jsonRequest("/api/dashboard", "GET")).then((r) => r.text()),
      ]);
      for (const body of bodies) {
        expect(body).not.toMatch(/\$2[aby]\$/);
        expect(body).not.toContain('"password"');
      }
    });

    it("stops an admin from granting admin/owner, and members from managing anyone", async () => {
      const target = await makeUser("target");

      actAs(admin.id);
      const asAdmin = await membersRoute.POST(
        jsonRequest("/x", "POST", { userId: target.id, role: "ADMIN" }),
        params({ workspaceId: ws.id }),
      );
      expect(asAdmin.status).toBe(403);
      const ownerRole = await membersRoute.POST(
        jsonRequest("/x", "POST", { userId: target.id, role: "OWNER" }),
        params({ workspaceId: ws.id }),
      );
      expect(ownerRole.status).toBe(400); // OWNER is not an addable role

      actAs(member.id);
      const asMember = await membersRoute.POST(
        jsonRequest("/x", "POST", { userId: target.id, role: "MEMBER" }),
        params({ workspaceId: ws.id }),
      );
      expect(asMember.status).toBe(403);

      actAs(admin.id);
      const ok = await membersRoute.POST(
        jsonRequest("/x", "POST", { userId: target.id, role: "MEMBER" }),
        params({ workspaceId: ws.id }),
      );
      expect(ok.status).toBe(201);
      expect((await ok.json()).user.password).toBeUndefined();
    });

    it("lets only the owner change roles; members can't promote themselves or peers", async () => {
      actAs(member.id);
      const res = await memberRoute.PATCH(
        jsonRequest("/x", "PATCH", { role: "ADMIN" }),
        params({ workspaceId: ws.id, memberId: admin.id }),
      );
      expect(res.status).toBe(403);

      actAs(owner.id);
      const ok = await memberRoute.PATCH(
        jsonRequest("/x", "PATCH", { role: "GUEST" }),
        params({ workspaceId: ws.id, memberId: member.id }),
      );
      expect(ok.status).toBe(200);
      await prisma.workspaceMember.update({
        where: { userId_workspaceId: { userId: member.id, workspaceId: ws.id } },
        data: { role: "MEMBER" },
      });
    });

    it("lets members leave but never removes the owner; deleting a workspace needs the owner", async () => {
      const leaver = await makeUser("leaver");
      await addMember(leaver.id, ws.id, "MEMBER");
      actAs(leaver.id);
      expect(
        (await memberRoute.DELETE(jsonRequest("/x", "DELETE"), params({ workspaceId: ws.id, memberId: leaver.id }))).status,
      ).toBe(200);

      actAs(admin.id);
      expect(
        (await memberRoute.DELETE(jsonRequest("/x", "DELETE"), params({ workspaceId: ws.id, memberId: owner.id }))).status,
      ).toBe(403);
      expect((await workspaceRoute.DELETE(jsonRequest("/x", "DELETE"), params({ workspaceId: ws.id }))).status).toBe(403);
    });

    it("deleting a workspace cascades to its tasks and tags", async () => {
      const temp = await makeWorkspace(owner.id, "Temp");
      const tag = await prisma.tag.create({ data: { name: "tmp", color: "#333333", workspaceId: temp.id } });
      await prisma.task.create({ data: { title: "tmp", userId: owner.id, workspaceId: temp.id, tags: { connect: { id: tag.id } } } });
      const res = await workspaceRoute.DELETE(jsonRequest("/x", "DELETE"), params({ workspaceId: temp.id }));
      expect(res.status).toBe(200);
      expect(await prisma.task.count({ where: { workspaceId: temp.id } })).toBe(0);
      expect(await prisma.tag.count({ where: { workspaceId: temp.id } })).toBe(0);
    });
  });

  describe("tags", () => {
    it("allows the same tag name in different workspaces but not twice in one", async () => {
      const make = (workspaceId: string) =>
        tagsRoute.POST(jsonRequest("/api/tags", "POST", { name: "Urgent", color: "#ef4444", workspaceId }));

      actAs(owner.id);
      expect((await make(ws.id)).status).toBe(201);
      expect((await make(ws.id)).status).toBe(409);
      actAs(outsider.id);
      expect((await make(otherWs.id)).status).toBe(201);
    });

    it("renames and deletes through /api/tags/[tagId], only for workspace members", async () => {
      const tag = await prisma.tag.create({ data: { name: "old", color: "#444444", workspaceId: ws.id } });

      actAs(outsider.id);
      expect((await tagRoute.PATCH(jsonRequest("/x", "PATCH", { name: "hack" }), params({ tagId: tag.id }))).status).toBe(403);

      actAs(member.id);
      const res = await tagRoute.PATCH(jsonRequest("/x", "PATCH", { name: "new" }), params({ tagId: tag.id }));
      expect((await res.json()).name).toBe("new");
      expect((await tagRoute.DELETE(jsonRequest("/x", "DELETE"), params({ tagId: tag.id }))).status).toBe(200);
    });
  });

  describe("user & preferences", () => {
    it("saves the display name and theme (the settings page used to drop the name)", async () => {
      const res = await userRoute.PUT(jsonRequest("/api/user", "PUT", { name: "New Name", theme: "DARK" }));
      expect(res.status).toBe(200);
      expect((await prisma.user.findUnique({ where: { id: owner.id } }))?.name).toBe("New Name");
      expect((await prisma.userPreference.findUnique({ where: { userId: owner.id } }))?.theme).toBe("DARK");
    });

    it("ignores attempts to set password or isPro through profile updates", async () => {
      const before = await prisma.user.findUnique({ where: { id: owner.id } });
      await userRoute.PUT(jsonRequest("/api/user", "PUT", { name: "X", password: "plaintext", isPro: true }));
      const after = await prisma.user.findUnique({ where: { id: owner.id } });
      expect(after?.password).toBe(before?.password);
      expect(after?.isPro).toBe(false);
    });

    it("persists theme through /api/preferences and rejects inaccessible default workspaces", async () => {
      expect((await preferencesRoute.PATCH(jsonRequest("/x", "PATCH", { theme: "LIGHT" }))).status).toBe(200);
      expect((await prisma.userPreference.findUnique({ where: { userId: owner.id } }))?.theme).toBe("LIGHT");

      expect((await preferencesRoute.PATCH(jsonRequest("/x", "PATCH", { defaultWorkspaceId: otherWs.id }))).status).toBe(403);
      expect((await preferencesRoute.PATCH(jsonRequest("/x", "PATCH", { defaultWorkspaceId: ws.id }))).status).toBe(200);
    });

    it("searches users by name or email without exposing sensitive fields", async () => {
      const res = await searchRoute.GET(jsonRequest("/api/user/search?query=outsider", "GET"));
      const body = await res.json();
      expect(body.existingUser.length).toBeGreaterThan(0);
      expect(JSON.stringify(body)).not.toContain("password");
      expect(body.meta.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe("dashboard", () => {
    it("returns tasks, team and reminders for the selected workspace", async () => {
      const res = await dashboardRoute.GET(jsonRequest(`/api/dashboard?workspaceId=${ws.id}`, "GET"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Object.keys(body)).toEqual(
        expect.arrayContaining(["taskCounts", "teamMembers", "reminders", "activeTasks"]),
      );
    });

    it("forbids reading another workspace's dashboard", async () => {
      const res = await dashboardRoute.GET(jsonRequest(`/api/dashboard?workspaceId=${otherWs.id}`, "GET"));
      expect(res.status).toBe(403);
    });
  });

  describe("cron reminders", () => {
    it("requires the CRON_SECRET bearer token", async () => {
      vi.stubEnv("CRON_SECRET", "s3cret");
      expect((await cronRoute.GET(new Request("http://localhost/api/cron/reminders"))).status).toBe(401);
      expect(
        (await cronRoute.GET(new Request("http://localhost/api/cron/reminders", { headers: { authorization: "Bearer wrong" } }))).status,
      ).toBe(401);
      vi.unstubAllEnvs();
    });

    it("notifies once per task per day", async () => {
      vi.stubEnv("CRON_SECRET", "s3cret");
      const due = new Date();
      due.setHours(23, 0, 0, 0);
      const task = await prisma.task.create({ data: { title: "due soon", userId: member.id, workspaceId: ws.id, dueDate: due } });
      const call = () =>
        cronRoute.GET(new Request("http://localhost/api/cron/reminders", { headers: { authorization: "Bearer s3cret" } }));

      expect((await call()).status).toBe(200);
      expect((await call()).status).toBe(200);
      const notes = await prisma.notification.count({ where: { userId: member.id, body: { contains: task.title } } });
      expect(notes).toBe(1);
      vi.unstubAllEnvs();
    });
  });
});
