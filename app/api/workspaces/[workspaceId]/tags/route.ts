import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { createTagSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await getUser();
    const workspaceId = params.workspaceId;
    if (!user || !user.id || !workspaceId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = request.json();
    const parsedBody = createTagSchema.safeParse(data);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!member) return new NextResponse("Forbidden", { status: 403 });

    const tag = await prisma.tag.create({
      data: {
        name: parsedBody.data.name,
        color: parsedBody.data.color,
        workspaceId,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("[TAG_CREATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await getUser();
    const workspaceId = params.workspaceId;

    if (!user || !user.id || !workspaceId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!membership) return new NextResponse("Forbidden", { status: 403 });

    const tags = await prisma.tag.findMany({
      where: {
        workspaceId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("[GET_TAGS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
