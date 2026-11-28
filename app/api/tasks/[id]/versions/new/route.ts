import getUser from "@/lib/getUser";
import { getTaskWithAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { RequestBodySchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";
import { s3PublicBase } from "@/lib/s3/client";

export async function POST(
  request: Request,
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

    const body = await request.json();
    const parsed = RequestBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { description, attachments } = parsed.data;

    // Attachments must live in our own bucket under the user's folder.
    if (
      attachments?.some(
        (a) => !a.url.startsWith(`${s3PublicBase()}/uploads/${user.id}/`),
      )
    ) {
      return NextResponse.json(
        { error: "Invalid attachment URL" },
        { status: 400 },
      );
    }

    const newVersion = await prisma.$transaction(async (tx) => {
      const latestVersion = await tx.taskVersion.findFirst({
        where: { taskId },
        orderBy: { version: "desc" },
      });

      const version = await tx.taskVersion.create({
        data: {
          taskId,
          version: latestVersion ? latestVersion.version + 1 : 1,
          description,
        },
      });

      if (attachments && attachments.length > 0) {
        await tx.attachment.createMany({
          data: attachments.map((att) => ({
            url: att.url,
            filename: att.filename,
            attachmentType: att.attachmentType,
            mimeType: att.mimeType,
            fileSize: att.fileSize,
            userId: user.id,
            taskVersionId: version.id,
          })),
        });
      }

      return version;
    });

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error("[NEW_TASK_VERSION_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
