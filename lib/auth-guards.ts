import { prisma } from "@/lib/prisma/prisma";

export async function canAccessWorkspace(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  return workspace !== null;
}

export async function assertWorkspaceMember(
  userId: string,
  workspaceId: string,
) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (member) return member;

  const owned = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: userId },
    select: { id: true },
  });
  if (owned) return { userId, workspaceId, role: "OWNER" as const };

  return null;
}

export async function getTaskWithAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      workspace: {
        select: {
          ownerId: true,
          members: { select: { userId: true } },
        },
      },
    },
  });

  if (!task) return null;

  const hasAccess =
    task.userId === userId ||
    task.workspace.ownerId === userId ||
    task.workspace.members.some((m) => m.userId === userId);

  return hasAccess ? task : null;
}

/** True when every tag id exists and belongs to the given workspace. */
export async function tagsBelongToWorkspace(
  tagIds: string[] | undefined,
  workspaceId: string,
): Promise<boolean> {
  const unique = [...new Set(tagIds ?? [])];
  if (unique.length === 0) return true;
  const count = await prisma.tag.count({
    where: { id: { in: unique }, workspaceId },
  });
  return count === unique.length;
}

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "audio/mpeg",
] as const;

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
