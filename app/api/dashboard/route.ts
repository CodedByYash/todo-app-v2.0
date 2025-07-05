import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@/prisma/generated/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id, email: user.email },
      include: {
        workspaces: true,
        ownedWorkspaces: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const priority = searchParams.get("priority") as
      | "low"
      | "medium"
      | "high"
      | "no_priority"
      | null;
    const dueDate = searchParams.get("dueDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const taskWhere: Prisma.TaskWhereInput = {
      userId: user.id,
    };

    if (workspaceId) {
      taskWhere.workspaceId = workspaceId;
    }

    if (priority) {
      taskWhere.priority = priority;
    }

    const now = new Date();

    if (dueDate === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      taskWhere.dueDate = { gte: start, lt: end };
    } else if (dueDate === "overdue") {
      taskWhere.dueDate = { lt: now };
      taskWhere.completed = false;
    } else if (dueDate === "upcoming") {
      taskWhere.dueDate = { gt: now };
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        tags: true,
        taskVersions: { select: { version: true, createdAt: true } },
      },
    });

    const totalTasks = await prisma.task.count({ where: taskWhere });
    const completedTasks = await prisma.task.count({
      where: { ...taskWhere, completed: true },
    });
    const pendingtasks = await prisma.task.count({
      where: { ...taskWhere, completed: true },
    });

    const tags = await prisma.tag.findMany({
      where: workspaceId ? { workspaceId } : undefined,
    });

    return NextResponse.json({
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        profilePicture: existingUser.profilePicture,
      },
      workspaces: [...existingUser.ownedWorkspaces, ...existingUser.workspaces],
      tags,
      tasks,
      pageInfo: {
        page,
        limit,
        total: totalTasks,
      },
      starus: {
        total: totalTasks,
        pending: pendingtasks,
        completed: completedTasks,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
