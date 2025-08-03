// app/api/today-progress/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";

export async function GET() {
  const user = await getUser();
  if (!user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      dueDate: { gte: today, lt: tomorrow },
    },
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return NextResponse.json({ total, completed, progress }, { status: 200 });
}
