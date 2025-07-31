// app/api/reminders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { reminderSchema } from "@/lib/schema/schema";
import { z } from "zod";

export async function GET() {
  const user = await getUser();
  if (!user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id, read: false },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notifications, { status: 200 });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const notification = await prisma.notification.update({
    where: { id, userId: user.id },
    data: { read: true },
  });
  return NextResponse.json(notification, { status: 200 });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsedData = reminderSchema.parse(body);

    const reminder = await prisma.reminder.create({
      data: {
        title: parsedData.title,
        body: parsedData.body,
        reminderDate: new Date(parsedData.reminderDate),
        userId: parsedData.userId,
        workspaceId: parsedData.workspaceId,
      },
    });
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
