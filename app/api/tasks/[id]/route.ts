import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import getUser from "@/lib/getUser";

const tasksSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  completed: z.boolean(),
  priority: z.enum(["low", "medium", "high", "no_priority"]),
  dueDate: z.string().datetime(),
  userId: z.string(),
  workspaceId: z.string(),
  parentTaskId: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUser();

    const task = await prisma.tasks.findUnique({
      where: { id: params.id, userId },
      include: { tags: true, subtasks: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
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

    const data = request.json();
    const parsedData = tasksSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    const existingTask = await prisma.tasks.findUnique({
      where: { id: params.id, userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const response = await prisma.tasks.update({
      where: { id: params.id },
      data: {
        ...(parsedData.data.title && { title: parsedData.data.title }),
        ...(parsedData.data.userId && { userId: parsedData.data.userId }),
        ...(parsedData.data.completed && {
          completed: parsedData.data.completed,
        }),
        ...(parsedData.data.dueDate && { dueDate: parsedData.data.dueDate }),
        ...(parsedData.data.parentTaskId && {
          parentTaskId: parsedData.data.parentTaskId,
        }),
        ...(parsedData.data.priority && { priority: parsedData.data.priority }),
        ...(parsedData.data.workspaceId && {
          workspaceId: parsedData.data.workspaceId,
        }),
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
