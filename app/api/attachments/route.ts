import getUser from "@/lib/getUser";
import { getTaskWithAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { AttachmentSchemaforpost } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = AttachmentSchemaforpost.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      url,
      filename,
      mimeType,
      fileSize,
      taskId,
      taskVersionId,
      attachmentType,
    } = parsed.data;

    if (taskId) {
      const task = await getTaskWithAccess(user.id, taskId);
      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
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
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
