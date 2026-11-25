import getUser from "@/lib/getUser";
import { getTaskWithAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { taskUpdateSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const task = await getTaskWithAccess(user.id, id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: task.id,
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      workspaceId: task.workspaceId,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const task = await getTaskWithAccess(user.id, id);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = taskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { title, priority, dueDate, workspaceId, tagIds, completed } =
      parsed.data;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(priority !== undefined && { priority }),
        ...(completed !== undefined && { completed }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(workspaceId !== undefined && { workspaceId }),
        ...(tagIds !== undefined && {
          tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
        }),
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const task = await getTaskWithAccess(user.id, id);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 },
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
