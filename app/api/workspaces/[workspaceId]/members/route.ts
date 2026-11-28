import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { AddMemberSchema } from "@/lib/schema/schema";
import { assertWorkspaceMember } from "@/lib/auth-guards";
import {
  badRequest,
  forbidden,
  notFound,
  publicUserSelect,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type Params = { params: Promise<{ workspaceId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { workspaceId } = await params;

    const parsed = AddMemberSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const { userId, role } = parsed.data;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });
    if (!workspace) return notFound("Workspace not found");

    const current = await assertWorkspaceMember(user.id, workspaceId);
    if (!current || !["OWNER", "ADMIN"].includes(current.role)) {
      return forbidden();
    }
    // Admins may only add regular members / guests; only the owner adds admins.
    if (role === "ADMIN" && current.role !== "OWNER") {
      return forbidden("Only the owner can add admins");
    }

    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!userToAdd) return notFound("User not found");

    const existingMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (existingMember) return badRequest("User is already a member");

    const newMember = await prisma.workspaceMember.create({
      data: { userId, workspaceId, role },
      include: { user: { select: publicUserSelect } },
    });
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    return serverError("ADD_WORKSPACE_MEMBER", error);
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { workspaceId } = await params;

    if (!(await assertWorkspaceMember(user.id, workspaceId))) {
      return forbidden();
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: publicUserSelect } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(members);
  } catch (error) {
    return serverError("GET_WORKSPACE_MEMBERS", error);
  }
}
