// /app/api/notifications/route.ts

import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NotificationSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  if (!user || !user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (existingUser) {
    return new NextResponse("unable to find user", { status: 404 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = NotificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid data", error: parsed.error.format() },
      { status: 400 }
    );
  }

  const notification = await prisma.notification.create({
    data: parsed.data,
  });

  return NextResponse.json(notification);
}
