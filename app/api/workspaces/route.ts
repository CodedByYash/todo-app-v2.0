import getUser from "@/lib/getUser";
import { canAccessWorkspace } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { createWorkspaceSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

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

    return NextResponse.json(workspaces, { status: 200 });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = createWorkspaceSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.flatten() },
        { status: 400 },
      );
    }

    const workspace = await prisma.$transaction(async (tx) => {
      const created = await tx.workspace.create({
        data: {
          workspacename: parsedData.data.workspacename,
          description: parsedData.data.description,
          imageUrl: parsedData.data.imageUrl,
          type: parsedData.data.type,
          organizationName: parsedData.data.organizationName,
          workspaceSize: parsedData.data.workspaceSize,
          organizationDomain: parsedData.data.organizationDomain,
          isPro: parsedData.data.isPro,
          subscriptionEndsAt: parsedData.data.subscriptionEndsAt
            ? new Date(parsedData.data.subscriptionEndsAt)
            : null,
          ownerId: user.id,
          tags: {
            connect: parsedData.data.tagIds?.map((id) => ({ id })) || [],
          },
        },
      });

      await tx.workspaceMember.create({
        data: {
          role: "OWNER",
          userId: user.id,
          workspaceId: created.id,
        },
      });

      return created;
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
