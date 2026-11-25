import getUser from "@/lib/getUser";
import { getTaskWithAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { CommentSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const task = await getTaskWithAccess(user.id, parsed.data.taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        taskId: parsed.data.taskId,
        userId: user.id,
      },
      include: { user: true },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[POST_COMMENT]", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const task = await getTaskWithAccess(user.id, taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[GET_COMMENTS]", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}
