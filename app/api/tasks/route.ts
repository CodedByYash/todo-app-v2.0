import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { tasksSchema } from "@/lib/schema/schema";
import { z } from "zod";

const tasksQuerySchema = z.object({
  workspaceId: z.string().uuid().optional(),
});

type TasksData = {
  id: string;
  title: string;
  completed: boolean;
  priority: "no_priority" | "low" | "medium" | "high";
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
export async function GET(request: Request) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(request.url);
    const query = tasksQuerySchema.safeParse({
      workspaceId: searchParams.get("workspaceId"),
    });

    if (!query.success) {
      return NextResponse.json(
        { message: "Invalid workspace id" },
        { status: 400 },
      );
    }
    const { workspaceId } = query.data;

    if (!user?.id || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause = {
      userId: user.id,
      completed: false,
      ...(workspaceId && {
        workspaceId,
        workspace: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      }),
    };

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        completed: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(tasks as TasksData[], { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    const { title, completed, priority, dueDate, workspaceId, tagIds } =
      parsedData.data;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid or inaccessible workspace" },
        { status: 403 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
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
      { status: 500 },
    );
  }
}
