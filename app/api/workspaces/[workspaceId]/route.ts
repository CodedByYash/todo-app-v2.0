import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { updateWorkspaceSchema } from "@/lib/schema/schema";
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

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { workspaceId } = await params;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        owner: { select: publicUserSelect },
        members: { include: { user: { select: publicUserSelect } } },
      },
    });
    if (!workspace) return notFound("Workspace not found");

    return NextResponse.json(workspace);
  } catch (error) {
    return serverError("GET_WORKSPACE", error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { workspaceId } = await params;

    const parsed = updateWorkspaceSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const data = parsed.data;

    const existing = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
    if (!existing) return notFound("Workspace not found");
    if (existing.ownerId !== user.id) return forbidden();

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(data.workspacename !== undefined && {
          workspacename: data.workspacename,
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.organizationName !== undefined && {
          organizationName: data.organizationName,
        }),
        ...(data.organizationDomain !== undefined && {
          organizationDomain: data.organizationDomain,
        }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return serverError("UPDATE_WORKSPACE", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { workspaceId } = await params;

    const existing = await prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: user.id },
      select: { id: true },
    });
    if (!existing) return forbidden();

    await prisma.workspace.delete({ where: { id: workspaceId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("DELETE_WORKSPACE", error);
  }
}
