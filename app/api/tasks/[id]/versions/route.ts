import getUser from "@/lib/getUser";
import { getTaskWithAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;
    const task = await getTaskWithAccess(user.id, taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const versions = await prisma.taskVersion.findMany({
      where: { taskId },
      include: { attachments: true },
      orderBy: { version: "desc" },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("[GET_TASK_VERSIONS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
