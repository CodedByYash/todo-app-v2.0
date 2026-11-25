import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NotificationSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[GET_NOTIFICATIONS]", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = NotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("[POST_NOTIFICATION]", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}
