import getUser from "@/lib/getUser";
import { getTaskWithAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { ActivityLogSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ActivityLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.taskId) {
      const task = await getTaskWithAccess(user.id, parsed.data.taskId);
      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
    }

    const log = await prisma.activityLog.create({
      data: {
        action: parsed.data.action,
        taskId: parsed.data.taskId,
        userId: user.id,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("[POST_ACTIVITY_LOG]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const task = await getTaskWithAccess(user.id, taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[GET_ACTIVITY_LOG]", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}
