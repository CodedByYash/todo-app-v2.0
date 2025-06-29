import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import getUser from "@/lib/getUser";
import { tasksSchema } from "@/lib/schema/schema";

export async function GET(request: Request) {
  try {
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

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

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user || !user.id) {
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

    const userId = user.id;
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

    const { title, completed, priority, dueDate } = parsedData.data;

    if (!title || !completed || !priority || !dueDate) {
      return NextResponse.json(
        { error: "invalid or missing information" },
        { status: 401 }
      );
    }

    const response = await prisma.tasks.create({
      data: {
        title,
        completed,
        priority,
        dueDate,
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
