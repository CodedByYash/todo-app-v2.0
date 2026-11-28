import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { getTaskWithAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { AttachmentSchemaforpost } from "@/lib/schema/schema";
import { isS3Configured, s3PublicBase } from "@/lib/s3/client";
import {
  badRequest,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = AttachmentSchemaforpost.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const { url, filename, mimeType, fileSize, taskId, taskVersionId, attachmentType } =
      parsed.data;

    // Only accept files that live in our own bucket under the user's folder.
    if (
      !isS3Configured() ||
      !url.startsWith(`${s3PublicBase()}/uploads/${user.id}/`)
    ) {
      return badRequest("Invalid attachment URL");
    }

    if (taskId && !(await getTaskWithAccess(user.id, taskId))) {
      return notFound("Task not found");
    }
    if (taskVersionId) {
      const version = await prisma.taskVersion.findUnique({
        where: { id: taskVersionId },
        select: { taskId: true },
      });
      if (!version || !(await getTaskWithAccess(user.id, version.taskId))) {
        return notFound("Task version not found");
      }
    }

    const attachment = await prisma.attachment.create({
      data: {
        url,
        filename,
        mimeType,
        fileSize,
        attachmentType,
        userId: user.id,
        taskId,
        taskVersionId,
      },
    });
    return NextResponse.json({ success: true, attachment }, { status: 201 });
  } catch (error) {
    return serverError("CREATE_ATTACHMENT", error);
  }
}
