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
  graphData: {
    data: {
      day: string;
      completed: number;
      uncompleted: number;
    }[];
  };
  // projectProgress: {
  //   completed: number;
  //   uncompleted: number;
  //   total: number;
  // };
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

    // Fetch all tasks in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const tasks = await prisma.task.findMany({
      where: {
        ...whereClause,
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { updatedAt: { gte: sevenDaysAgo } },
        ],
      },
      select: {
        createdAt: true,
        updatedAt: true,
        completed: true,
        priority: true,
        dueDate: true,
      },
    });

    // Task counts
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < new Date(),
    ).length;
    const ongoing = total - completed;

    // Analytics: Tasks by priority
    const byPriority = {
      low: tasks.filter((t) => t.priority === "low").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      high: tasks.filter((t) => t.priority === "high").length,
    };

    // Analytics: Tasks by status over time (last 7 days)
    const byStatusOverTime = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayTasks = tasks.filter(
        (t) => t.createdAt.toISOString().split("T")[0] === dateStr,
      );
      return {
        date: dateStr,
        completed: dayTasks.filter((t) => t.completed).length,
        ongoing: dayTasks.filter((t) => !t.completed).length,
      };
    }).reverse();

    // Graph Data: Completed and uncompleted tasks for the last 7 days
    const graphData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const weekday = date.toLocaleString("en-US", { weekday: "long" });

      const completedCount = tasks.filter(
        (t) =>
          t.completed &&
          t.updatedAt &&
          t.updatedAt.toISOString().split("T")[0] === dateStr,
      ).length;

      const uncompletedCount = tasks.filter(
        (t) =>
          !t.completed && t.createdAt.toISOString().split("T")[0] === dateStr,
      ).length;

      return {
        day: weekday,
        completed: completedCount,
        uncompleted: uncompletedCount,
      };
    }).reverse();

    const data: DashboardData = {
      taskCounts: { total, completed, ongoing, overdue },
      analytics: { byPriority, byStatusOverTime },
      graphData: { data: graphData },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}

// POST: Create a task (unchanged)
export const tasksSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  completed: z.boolean().default(false),
  priority: z.enum(["no_priority", "low", "medium", "high"]),
  dueDate: z
    .string()
    .optional()
    .transform((val) => (val ? val : null))
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date-time format",
    }),
  tagIds: z.array(z.string().uuid("Invalid tag ID")).optional(),
  workspaceId: z.string().uuid("Invalid workspace ID"),
  userId: z.string().uuid("Invalid user ID"),
});

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const parsedData = tasksSchema.safeParse(data);

    if (!parsedData.success) {
      console.error("Validation error:", parsedData.error.errors);
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 },
      );
    }

    const { title, completed, priority, dueDate, workspaceId, tagIds, userId } =
      parsedData.data;

    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Cannot create task for another user" },
        { status: 403 },
      );
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid or inaccessible workspace" },
        { status: 403 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        workspaceId,
        tags: {
          connect: tagIds?.map((id: string) => ({ id })) || [],
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
