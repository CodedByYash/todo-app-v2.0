import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { deleteFromS3 } from "@/lib/s3/deleteFromS3";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  try {
    const { attachmentId } = await params;
    const user = await getUser();

    if (!user || !user.id || !attachmentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingAttachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });
    if (!existingAttachment)
      return new NextResponse("Not found", { status: 404 });

    const url = new URL(existingAttachment.url);
    const fileKey = decodeURIComponent(url.pathname.slice(1));

    await deleteFromS3(fileKey);

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return new NextResponse("Attachment deleted", { status: 200 });
  } catch (err) {
    console.error("[DELETE_ATTACHMENT]", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
