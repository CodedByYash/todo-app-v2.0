import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { tasksSchema } from "@/lib/schema/schema";

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getUser();

    if (!user || !params.taskId || user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }

    const userId = user.id;

    const task = await prisma.tasks.findUnique({
      where: { id: params.taskId, userId },
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
  { params }: { params: { taskId: string; workspaceId: string } }
) {
  try {
    const user = await getUser();

    if (!user || !params.taskId || !params.workspaceId || user.id) {
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

    const existingTask = await prisma.tasks.findUnique({
      where: { id: params.taskId, userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const response = await prisma.tasks.update({
      where: { id: params.taskId },
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
  { params }: { params: { taskid: string } }
) {
  try {
    const id = params.taskid;
    const user = await getUser();

    if (!id || !user || !user.id) {
      return NextResponse.json({ error: "id is missing" }, { status: 401 });
    }

    const existingTask = await prisma.tasks.findUnique({ where: { id } });

    if (!existingTask) {
      return NextResponse.json({ error: "task is missing" }, { status: 404 });
    }

    const userId = user?.id;

    const response = await prisma.tasks.delete({ where: { id, userId } });

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
