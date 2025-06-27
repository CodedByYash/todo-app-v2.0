import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  try {
    const userId = await getUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = request.json();

    const parsedData = tasksSchema.safeParse(data);
    if (!parsedData.success) {
      console.log("Validation errors:", parsedData.error.errors);
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 404 }
      );
    }

    //doubt: workspace id will come in request or we have to find in db
    const workspace = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!workspace) {
      return null;
    }

    const workspaceId = workspace.id;

    const response = await prisma.tasks.create({
      data: {
        title: parsedData.data.title,
        completed: parsedData.data.completed,
        priority: parsedData.data.priority,
        dueDate: parsedData.data.dueDate,
        userId,
        workspaceId,
      },
    });

    if (!response) {
      return NextResponse.json(
        { error: "Failed to create tasks" },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUser();

    const tasks = await prisma.tasks.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!tasks) {
      return NextResponse.json(
        { error: "failed to fetch tasks" },
        { status: 404 }
      );
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
