import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { workspaceSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
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
    });

    if (!workspaces) {
      return NextResponse.json(
        { message: "no workspace exists" },
        { status: 404 }
      );
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

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

    if (
      !description ||
      !imageUrl ||
      !workspacename ||
      !type ||
      !organizationName ||
      !organizationDomain ||
      !workspaceSize
    ) {
      return NextResponse.json(
        { error: "information is missing" },
        { status: 400 }
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
        ownerId: userId,
        users: {
          connect: {
            id: userId,
          },
        },
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: "Failed to create workspace" },
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
