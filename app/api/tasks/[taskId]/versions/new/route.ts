import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { RequestBodySchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getUser();
    const taskId = await params.taskId;

    if (!user || !user.id || taskId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = RequestBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { description, attachments } = parsed.data;

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    const latestVersion = await prisma.taskVersion.findFirst({
      where: { taskId },
      orderBy: { version: "desc" },
    });

    const newVersion = await prisma.taskVersion.create({
      data: {
        taskId,
        version: latestVersion ? latestVersion.version + 1 : 1,
        description,
      },
    });

    if (attachments && attachments.length > 0) {
      await prisma.attachment.createMany({
        data: attachments.map((att) => ({
          url: att.url,
          filename: att.filename,
          attachmentType: att.attachmentType,
          mimeType: att.mimeType,
          fileSize: att.fileSize,
          userId: user.id,
          taskversionId: newVersion.id,
        })),
      });
    }

    return NextResponse.json(newVersion);
  } catch (error) {
    console.error("[NEW_TASK_VERSION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
