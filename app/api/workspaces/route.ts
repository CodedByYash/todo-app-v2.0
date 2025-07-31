import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { workspaceSchema } from "@/lib/schema/schema";
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
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = workspaceSchema.parse(body);

    const workspace = await prisma.workspace.create({
      data: {
        workspacename: parsedData.workspacename,
        description: parsedData.description,
        imageUrl: parsedData.imageUrl,
        type: parsedData.type,
        organizationName: parsedData.organizationName,
        workspaceSize: parsedData.workspaceSize,
        organizationDomain: parsedData.organizationDomain,
        isPro: parsedData.isPro,
        subscriptionEndsAt: parsedData.subscriptionEndsAt
          ? new Date(parsedData.subscriptionEndsAt)
          : null,
        ownerId: parsedData.ownerId,
        tags: {
          connect: parsedData.tagIds?.map((id: string) => ({ id })) || [],
        },
      },
    });
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
