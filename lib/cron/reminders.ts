// lib/cron/reminders.ts
import { PrismaClient } from "@/prisma/generated/prisma";
import { NextResponse } from "next/server";
import { schedule } from "node-cron";

const prisma = new PrismaClient();

export function scheduleReminders() {
  schedule("0 8 * * *", async () => {
    // Daily at 8 AM
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: { lte: new Date() },
        completed: false,
      },
      include: { user: true },
    });

    for (const task of tasks) {
      if (!task.dueDate) {
        return new NextResponse("Due Date is null", { status: 400 });
      }
      await prisma.notification.create({
        data: {
          userId: task.userId,
          title: "Task Reminder",
          body: `Task "${task.title}" is ${
            task.dueDate < new Date() ? "overdue" : "due today"
          }.`,
          read: false,
        },
      });
    }
  });
}
