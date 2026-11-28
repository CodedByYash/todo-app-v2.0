import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { tasksSchema } from "@/lib/schema/schema";
import { canAccessWorkspace, tagsBelongToWorkspace } from "@/lib/auth-guards";
import {
  badRequest,
  forbidden,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";
import { z } from "zod";

const tasksQuerySchema = z.object({
  workspaceId: z.uuid().optional(),
});

const taskSelect = {
  id: true,
  title: true,
  completed: true,
  priority: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
  workspaceId: true,
  tags: { select: { id: true, name: true, color: true } },
} as const;

/** GET /api/tasks?workspaceId=… — the signed-in user's open tasks. */
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const query = tasksQuerySchema.safeParse({
      workspaceId: searchParams.get("workspaceId") ?? undefined,
    });
    if (!query.success) return badRequest("Invalid workspace id");
    const { workspaceId } = query.data;

    if (workspaceId && !(await canAccessWorkspace(user.id, workspaceId))) {
      return forbidden("Invalid or inaccessible workspace");
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        completed: false,
        ...(workspaceId
          ? { workspaceId }
          : {
              workspace: {
                OR: [
                  { ownerId: user.id },
                  { members: { some: { userId: user.id } } },
                ],
              },
            }),
      },
      orderBy: { createdAt: "desc" },
      select: taskSelect,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return serverError("GET_TASKS", error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = tasksSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const { title, completed, priority, dueDate, workspaceId, tagIds } =
      parsed.data;

    if (!(await canAccessWorkspace(user.id, workspaceId))) {
      return forbidden("Invalid or inaccessible workspace");
    }
    if (!(await tagsBelongToWorkspace(tagIds, workspaceId))) {
      return badRequest("One or more tags do not belong to this workspace");
    }

    const task = await prisma.task.create({
      data: {
        title,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
        workspaceId,
        tags: { connect: [...new Set(tagIds ?? [])].map((id) => ({ id })) },
      },
      select: taskSelect,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return serverError("CREATE_TASK", error);
  }
}
