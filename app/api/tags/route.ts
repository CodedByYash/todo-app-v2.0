import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { tagSchema, tagUpdateSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsedData = tagSchema.parse(body);
    if (!parsedData.workspaceId) {
      return NextResponse.json("workspaceId is not provided", { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: {
        name: parsedData.name,
        workspaceId: parsedData.workspaceId,
        color: parsedData.color,
      },
    });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  try {
    const tags = await prisma.tag.findMany({
      where: { workspaceId },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsedData = tagUpdateSchema.parse(body);
    if (!parsedData.workspaceId) {
      return NextResponse.json("workspaceId not provided");
    }

    const tag = await prisma.tag.update({
      where: { id: parsedData.tagId },
      data: { workspaceId: parsedData.workspaceId },
    });
    return NextResponse.json(tag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}
