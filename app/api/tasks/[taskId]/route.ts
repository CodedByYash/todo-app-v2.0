import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { tasksSchema } from "@/lib/schema/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const user = await getUser();

    if (!user || !taskId || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    const userId = user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId, userId },
      include: { tags: true, subtasks: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ taskId: string; workspaceId: string }> }
) {
  try {
    const user = await getUser();
    const { taskId, workspaceId } = await params;

    if (!user || !taskId || !workspaceId || !user.id) {
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

    const userId = user.id;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const response = await prisma.task.update({
      where: { id: taskId },
      data: parsedData.data,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const user = await getUser();

    if (!taskId || !user || !user.id) {
      return NextResponse.json({ error: "id is missing" }, { status: 401 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "task is missing" }, { status: 404 });
    }

    const userId = user?.id;

    const response = await prisma.task.delete({
      where: { id: taskId, userId },
    });

    if (!response) {
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
