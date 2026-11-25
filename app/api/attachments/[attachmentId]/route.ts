import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { deleteFromS3 } from "@/lib/s3/deleteFromS3";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  try {
    const { attachmentId } = await params;
    const user = await getUser();

    if (!user?.id || !attachmentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingAttachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, userId: user.id },
    });

    if (!existingAttachment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = new URL(existingAttachment.url);
    const fileKey = decodeURIComponent(url.pathname.slice(1));

    await deleteFromS3(fileKey);

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE_ATTACHMENT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
