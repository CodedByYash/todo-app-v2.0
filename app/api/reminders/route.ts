import getUser from "@/lib/getUser";
import { canAccessWorkspace } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { reminderSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reminders, { status: 200 });
  } catch (error) {
    console.error("[GET_REMINDERS]", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 },
    );
  }
}

async function markReminderComplete(request: Request, userId: string) {
  const url = new URL(request.url);
  const idFromQuery = url.searchParams.get("id");
  let id = idFromQuery;

  if (!id) {
    try {
      const body = await request.json();
      id = body?.id;
    } catch {
      // no body
    }
  }

  if (!id) {
    return NextResponse.json({ error: "Missing reminder id" }, { status: 400 });
  }

  const result = await prisma.reminder.updateMany({
    where: { id, userId },
    data: { completed: true },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await markReminderComplete(request, user.id);
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await markReminderComplete(request, user.id);
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsedData = reminderSchema.parse(body);

    const hasAccess = await canAccessWorkspace(
      user.id,
      parsedData.workspaceId,
    );
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Invalid or inaccessible workspace" },
        { status: 403 },
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        title: parsedData.title,
        body: parsedData.body,
        reminderDate: new Date(parsedData.reminderDate),
        userId: user.id,
        workspaceId: parsedData.workspaceId,
        completed: parsedData.completed ?? false,
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
      { status: 500 },
    );
  }
}
