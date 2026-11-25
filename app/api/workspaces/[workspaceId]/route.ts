import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { updateWorkspaceSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getUser();
    const { workspaceId } = await params;

    if (!user || !workspaceId || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: "workspace creation failed" },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getUser();
    const { workspaceId } = await params;

    if (!user || !workspaceId || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const data = await request.json();
    const parsedData = updateWorkspaceSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.flatten() },
        { status: 400 },
      );
    }

    const existingWorkspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
    });
    if (!existingWorkspace || existingWorkspace.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: parsedData.data,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "unable to update workspace" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getUser();
    const { workspaceId } = await params;

    if (!user || !workspaceId || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const existingWorkspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: userId },
    });

    if (!existingWorkspace) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
