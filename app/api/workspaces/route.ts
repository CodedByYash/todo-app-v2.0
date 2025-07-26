import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { workspaceSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

type ErrorResponse = { error: string | z.ZodError["errors"] };

export async function GET() {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workspaces, { status: 20 });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const parsedData = workspaceSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 404 }
      );
    }

    const {
      description,
      imageUrl,
      workspacename,
      type,
      organizationName,
      organizationDomain,
      workspaceSize,
    } = parsedData.data;

    const existingWorkspace = await prisma.workspace.findFirst({
      where: { workspacename, ownerId: user.id },
    });

    if (existingWorkspace) {
      return NextResponse.json(
        { error: "Workspace name already exists" },
        { status: 409 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        description,
        imageUrl,
        workspacename,
        type,
        organizationName,
        organizationDomain,
        workspaceSize,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
