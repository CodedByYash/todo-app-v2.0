import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import getUser from "@/lib/getUser";

// Query schema for validation
const dashboardQuerySchema = z.object({
  workspaceId: z.string().uuid().optional(),
});

// Response type
type DashboardData = {
  taskCounts: {
    total: number;
    completed: number;
    ongoing: number;
    overdue: number;
  };
  analytics: {
    byPriority: { low: number; medium: number; high: number };
    byStatusOverTime: { date: string; completed: number; ongoing: number }[];
  };
};

// GET: Fetch dashboard data
export async function GET(request: Request) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = dashboardQuerySchema.safeParse({
      workspaceId: searchParams.get("workspaceId"),
    });

    if (!query.success) {
      return NextResponse.json({ error: query.error.errors }, { status: 400 });
    }

    const { workspaceId } = query.data;

    // Base where clause
    const whereClause = {
      userId: user.id,
      ...(workspaceId && {
        workspaceId,
        workspace: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      }),
    };

    // Task counts
    const [total, completed, overdue] = await Promise.all([
      prisma.task.count({ where: whereClause }),
      prisma.task.count({ where: { ...whereClause, completed: true } }),
      prisma.task.count({
        where: {
          ...whereClause,
          completed: false,
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    const ongoing = total - completed;

    // Analytics: Tasks by priority
    const priorityCounts = await prisma.task.groupBy({
      by: ["priority"],
      where: whereClause,
      _count: { _all: true },
    });

    const byPriority = {
      low: priorityCounts.find((p) => p.priority === "low")?._count._all || 0,
      medium:
        priorityCounts.find((p) => p.priority === "medium")?._count._all || 0,
      high: priorityCounts.find((p) => p.priority === "high")?._count._all || 0,
    };

    // Analytics: Tasks by status over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasksByDate = await prisma.task.groupBy({
      by: ["createdAt"],
      where: { ...whereClause, createdAt: { gte: sevenDaysAgo } },
      _count: { completed: true, _all: true },
    });

    const byStatusOverTime = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayTasks = tasksByDate.filter(
        (t) => t.createdAt.toISOString().split("T")[0] === dateStr
      );
      return {
        date: dateStr,
        completed: dayTasks.reduce(
          (sum, t) => sum + (t._count.completed || 0),
          0
        ),
        ongoing: dayTasks.reduce(
          (sum, t) => sum + (t._count._all - (t._count.completed || 0)),
          0
        ),
      };
    }).reverse();

    const data: DashboardData = {
      taskCounts: { total, completed, ongoing, overdue },
      analytics: { byPriority, byStatusOverTime },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
