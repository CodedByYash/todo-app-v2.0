import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import getUser from "@/lib/getUser";
import { canAccessWorkspace } from "@/lib/auth-guards";
import { forbidden, serverError, unauthorized, badRequest } from "@/lib/api";

const dashboardQuerySchema = z.object({
  workspaceId: z.uuid().optional(),
});

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
  reminders: {
    id: string;
    title: string;
    body: string | null;
    reminderDate: string;
    createdAt: string;
  }[];
  teamMembers: {
    id: string;
    name: string | null;
    email: string;
  }[];
  activeTasks: {
    id: string;
    title: string;
    completed: boolean;
    priority: "no_priority" | "low" | "medium" | "high";
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
};

// GET: Fetch dashboard data
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const query = dashboardQuerySchema.safeParse({
      workspaceId: searchParams.get("workspaceId") ?? undefined,
    });

    if (!query.success) return badRequest(query.error);

    const { workspaceId } = query.data;
    if (workspaceId && !(await canAccessWorkspace(user.id, workspaceId))) {
      return forbidden("Invalid or inaccessible workspace");
    }

    // Base where clause for tasks (simplified, no 7-day limit initially)
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

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        completed: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fetch reminders (removed completed filter due to schema mismatch)
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.id,
        completed: false,
        ...(workspaceId && { workspaceId }),
      },
      orderBy: { reminderDate: "asc" },
      select: {
        id: true,
        title: true,
        body: true,
        reminderDate: true,
        createdAt: true,
      },
    });

    // Fetch workspace members
    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: {
        workspace: {
          ...(workspaceId && { id: workspaceId }),
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    // Analytics: Tasks by status over time (last 7 days, optional re-add later)
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

    // Format reminders with string dates
    const formattedReminders = reminders.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      reminderDate: r.reminderDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));

    // Format team members
    const teamMembers = [
      ...new Map(workspaceMembers.map((wm) => [wm.user.id, wm.user])).values(),
    ];

    // Filter active tasks (ongoing)
    const activeTasks = tasks
      .filter((t) => !t.completed)
      .map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() || null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));

    const data: DashboardData = {
      taskCounts: { total, completed, ongoing, overdue },
      analytics: { byPriority, byStatusOverTime },
      graphData: { data: graphData },
      reminders: formattedReminders,
      teamMembers,
      activeTasks,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return serverError("GET_DASHBOARD", error);
  }
}
