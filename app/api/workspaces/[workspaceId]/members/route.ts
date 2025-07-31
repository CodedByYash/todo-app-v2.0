import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { AddMemberSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getUser();
    const { workspaceId } = await params;
    if (!user || !user.id || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = request.body;
    const parsedBody = AddMemberSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: "invalid body" }, { status: 401 });
    }

    const { userId, role } = parsedBody.data;

    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!existingWorkspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    const currentMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!currentMember || !["OWNER", "ADMIN"].includes(currentMember.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const userToAdd = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userToAdd) {
      return new NextResponse("User not found", { status: 404 });
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (existingMember) {
      return new NextResponse("User already a member", { status: 400 });
    }

    const newMember = await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId,
        role,
      },
      include: { user: true },
    });

    return NextResponse.json(newMember);
  } catch (err) {
    console.error("[ADD_WORKSPACE_MEMBER]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await params;

    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            username: true,
          },
        },
      },
      orderBy: {
        role: "asc",
      },
    });

    return NextResponse.json(members, { status: 200 });
  } catch (err) {
    console.error("[GET_WORKSPACE_MEMBERS]", err);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
