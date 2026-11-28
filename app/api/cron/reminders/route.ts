import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

// Called daily by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setUTCHours(23, 59, 59, 999);
  const since = new Date(now.getTime() - 20 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: { completed: false, dueDate: { lte: endOfToday } },
    select: { id: true, title: true, userId: true, dueDate: true },
  });

  let created = 0;
  for (const task of tasks) {
    const overdue = task.dueDate !== null && task.dueDate < now;
    const body = `Task "${task.title}" is ${overdue ? "overdue" : "due today"}.`;

    // Don't notify again if an identical reminder went out in the last day.
    const already = await prisma.notification.findFirst({
      where: { userId: task.userId, body, createdAt: { gte: since } },
      select: { id: true },
    });
    if (already) continue;

    await prisma.notification.create({
      data: { userId: task.userId, title: "Task Reminder", body },
    });
    created++;
  }

  return NextResponse.json({ checked: tasks.length, created });
}
