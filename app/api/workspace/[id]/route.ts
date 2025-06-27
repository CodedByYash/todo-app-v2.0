import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const workspaceSchema = z.object({
  workspacename: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  type: z.enum(["PERSONAL", "PROFESSIONAL"]),
  organizationName: z.string().optional(),
  workspaceSize: z.number(),
  organizationDomain: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: params.id,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const parsedData = workspaceSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "invalid data" }, { status: 401 });
    }

    const existingWorkspace = await prisma.workspace.findFirst({
      where: { id: params.id },
    });
    if (!existingWorkspace || existingWorkspace.ownerId !== userId) {
      return NextResponse.json(
        { error: "no workspace present" },
        { status: 403 }
      );
    }

    const updated = await prisma.workspace.update({
      where: { id: params.id },
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingWorkspace = await prisma.workspace.delete({
      where: { id: params.id },
    });

    if (!existingWorkspace || existingWorkspace.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const response = await prisma.workspace.delete({
      where: { id: params.id },
    });

    if (!response) {
      return NextResponse.json(
        { message: "failed to delete task" },
        { status: 403 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
