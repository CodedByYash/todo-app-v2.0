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

export async function GET(request: Request) {
  try {
    const userId = await getUser();

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
        { status: 401 }
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
    const userId = await getUser();

    const data = request.json();
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
