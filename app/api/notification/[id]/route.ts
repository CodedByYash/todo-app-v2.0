import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH_NOTIFICATION]", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}
