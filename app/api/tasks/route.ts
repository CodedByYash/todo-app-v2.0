import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const data = request.json();

    const parsedData = tasksSchema.safeParse(data);
    if (!parsedData.success) {
      console.log("Validation errors:", parsedData.error.errors);
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
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

    if (response) {
      console.log("task created", response.id);
    }
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const tasks = await prisma.tasks.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (tasks) {
      console.log("fetched tasks successfully");
    }
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {}
