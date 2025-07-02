import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { AttachmentSchemaforpost } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getUser();

    if (user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user?.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = AttachmentSchemaforpost.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
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

    const attachment = await prisma.attachments.create({
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

    return NextResponse.json({ success: true, attachment });
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
