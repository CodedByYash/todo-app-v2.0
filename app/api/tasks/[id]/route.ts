import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import {
  canAccessWorkspace,
  getTaskWithAccess,
  tagsBelongToWorkspace,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { taskUpdateSchema } from "@/lib/schema/schema";
import {
  badRequest,
  forbidden,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const task = await getTaskWithAccess(user.id, id);
    if (!task) return notFound("Task not found");

    return NextResponse.json({
      id: task.id,
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      workspaceId: task.workspaceId,
    });
  } catch (error) {
    return serverError("GET_TASK", error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const task = await getTaskWithAccess(user.id, id);
    if (!task) return notFound("Task not found or unauthorized");

    const parsed = taskUpdateSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const { title, priority, dueDate, workspaceId, tagIds, completed } =
      parsed.data;

    // Moving a task requires access to the destination workspace.
    if (
      workspaceId !== undefined &&
      workspaceId !== task.workspaceId &&
      !(await canAccessWorkspace(user.id, workspaceId))
    ) {
      return forbidden("Invalid or inaccessible workspace");
    }

    const targetWorkspaceId = workspaceId ?? task.workspaceId;
    if (tagIds !== undefined) {
      if (!(await tagsBelongToWorkspace(tagIds, targetWorkspaceId))) {
        return badRequest("One or more tags do not belong to this workspace");
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(priority !== undefined && { priority }),
        ...(completed !== undefined && { completed }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(workspaceId !== undefined && { workspaceId }),
        ...(tagIds !== undefined && {
          tags: { set: [...new Set(tagIds)].map((tagId) => ({ id: tagId })) },
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return serverError("UPDATE_TASK", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const task = await getTaskWithAccess(user.id, id);
    if (!task) return notFound("Task not found or unauthorized");

    // Only the creator or the workspace owner may delete a task.
    if (task.userId !== user.id && task.workspace.ownerId !== user.id) {
      return forbidden("Only the task creator or workspace owner can delete it");
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("DELETE_TASK", error);
  }
}
