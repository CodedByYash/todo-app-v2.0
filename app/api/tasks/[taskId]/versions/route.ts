import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getUser();
    const taskId = await params.taskId;

    if (!user || !user.id || !taskId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.tasks.findUnique({
      where: {
        id: taskId,
      },
      include: {
        workspace: { include: { members: true } },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "task does not exists" },
        { status: 404 }
      );
    }

    const isMember = task.workspace.members.some(
      (member) => member.id === user.id
    );

    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const versions = await prisma.taskVersion.findMany({
      where: {
        taskId,
      },
      include: { attachments: true },
      orderBy: { version: "desc" },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
