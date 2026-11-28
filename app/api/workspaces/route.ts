import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { createWorkspaceSchema } from "@/lib/schema/schema";
import {
  badRequest,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

const memberUser = { select: { id: true, name: true } } as const;

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        members: { include: { user: memberUser } },
        owner: memberUser,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    return serverError("GET_WORKSPACES", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = createWorkspaceSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const data = parsed.data;

    const workspace = await prisma.$transaction(async (tx) => {
      const created = await tx.workspace.create({
        data: {
          workspacename: data.workspacename,
          description: data.description ?? null,
          imageUrl: data.imageUrl || null,
          type: data.type,
          organizationName: data.organizationName ?? null,
          organizationDomain: data.organizationDomain ?? null,
          ownerId: user.id,
        },
      });
      await tx.workspaceMember.create({
        data: { role: "OWNER", userId: user.id, workspaceId: created.id },
      });
      return created;
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return serverError("CREATE_WORKSPACE", error);
  }
}
