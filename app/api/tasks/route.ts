import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { tasksSchema } from "@/lib/schema/schema";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { tags: true },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const parsedData = tasksSchema.safeParse(data);

    if (!parsedData.success) {
      console.error("Validation error:", parsedData.error.errors);
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { title, completed, priority, dueDate, workspaceId, tagIds, userId } =
      parsedData.data;

    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Cannot create task for another user" },
        { status: 403 }
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid or inaccessible workspace" },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        workspaceId,
        tags: {
          connect: tagIds?.map((id: string) => ({ id })) || [],
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
