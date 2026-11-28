import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { serverError, unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const where = { userId: user.id, dueDate: { gte: start, lt: end } };
    const [total, completed] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, completed: true } }),
    ]);
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return NextResponse.json({ total, completed, progress });
  } catch (error) {
    return serverError("TODAYS_PROGRESS", error);
  }
}
