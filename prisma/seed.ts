/**
 * Seeds demo data. Safe to re-run: it only removes and recreates the demo
 * users below (and, through cascading deletes, everything they own).
 *
 *   npm run db:seed
 *
 * Demo logins (all share one password): alex@taskito.dev, sam@taskito.dev,
 * jordan@taskito.dev  /  Password123!
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const DEMO_PASSWORD = "Password123!";
const DEMO_EMAILS = ["alex@taskito.dev", "sam@taskito.dev", "jordan@taskito.dev"];

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const day = 24 * 60 * 60 * 1000;
const at = (offsetDays: number, hour = 17) => {
  const d = new Date(Date.now() + offsetDays * day);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  // Remove previous demo data (workspaces owned by demo users cascade).
  await prisma.user.deleteMany({ where: { email: { in: DEMO_EMAILS } } });

  const password = await hash(DEMO_PASSWORD, 10);
  const mkUser = (email: string, name: string, bio: string) =>
    prisma.user.create({
      data: {
        id: randomUUID(),
        email,
        name,
        bio,
        password,
        emailVerified: new Date(),
        onboardingCompleted: true,
        userPreferences: { create: { theme: "SYSTEM" } },
      },
    });

  const [alex, sam, jordan] = await Promise.all([
    mkUser("alex@taskito.dev", "Alex Rivera", "Product designer, keeps a very long list."),
    mkUser("sam@taskito.dev", "Sam Okafor", "Frontend engineer."),
    mkUser("jordan@taskito.dev", "Jordan Lee", "Marketing lead."),
  ]);

  // Workspaces -------------------------------------------------------------
  const personal = await prisma.workspace.create({
    data: {
      id: randomUUID(),
      workspacename: "Alex's workspace",
      description: "Personal errands and side projects.",
      type: "PERSONAL",
      ownerId: alex.id,
      members: { create: { userId: alex.id, role: "OWNER" } },
    },
  });
  const launch = await prisma.workspace.create({
    data: {
      id: randomUUID(),
      workspacename: "Product launch",
      description: "Everything for the v2 launch.",
      type: "PROFESSIONAL",
      organizationName: "Taskito Labs",
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: "OWNER" },
          { userId: sam.id, role: "ADMIN" },
          { userId: jordan.id, role: "MEMBER" },
        ],
      },
    },
  });

  await prisma.userPreference.updateMany({
    where: { userId: alex.id },
    data: { defaultWorkspaceId: launch.id },
  });
  await prisma.userPreference.updateMany({
    where: { userId: { in: [sam.id, jordan.id] } },
    data: { defaultWorkspaceId: launch.id },
  });

  // Tags --------------------------------------------------------------------
  const tag = (name: string, color: string, workspaceId: string) =>
    prisma.tag.create({ data: { id: randomUUID(), name, color, workspaceId } });

  const [home, health, urgent, design, eng, marketing] = await Promise.all([
    tag("Home", "#0f9d6b", personal.id),
    tag("Health", "#e8a33d", personal.id),
    tag("Urgent", "#ef4444", launch.id),
    tag("Design", "#8b5cf6", launch.id),
    tag("Engineering", "#3b82f6", launch.id),
    tag("Marketing", "#ec4899", launch.id),
  ]);

  // Tasks -------------------------------------------------------------------
  type TaskSeed = {
    title: string;
    priority: "low" | "medium" | "high" | "no_priority";
    due: Date | null;
    done?: boolean;
    userId: string;
    workspaceId: string;
    tags?: { id: string }[];
    createdDaysAgo?: number;
    completedDaysAgo?: number;
  };

  const tasks: TaskSeed[] = [
    // Personal (Alex)
    { title: "Book dentist appointment", priority: "medium", due: at(1), userId: alex.id, workspaceId: personal.id, tags: [health] },
    { title: "Renew passport", priority: "high", due: at(-2), userId: alex.id, workspaceId: personal.id },
    { title: "Buy groceries for the weekend", priority: "low", due: at(0, 18), userId: alex.id, workspaceId: personal.id, tags: [home] },
    { title: "Fix the leaking kitchen tap", priority: "no_priority", due: null, userId: alex.id, workspaceId: personal.id, tags: [home] },
    { title: "Pay electricity bill", priority: "high", due: at(0, 12), done: true, userId: alex.id, workspaceId: personal.id, completedDaysAgo: 0 },
    // Product launch
    { title: "Finalize pricing page copy", priority: "high", due: at(0, 15), userId: alex.id, workspaceId: launch.id, tags: [urgent, marketing] },
    { title: "Design the empty states", priority: "medium", due: at(2), userId: alex.id, workspaceId: launch.id, tags: [design] },
    { title: "Review pull request #42", priority: "high", due: at(0, 11), userId: sam.id, workspaceId: launch.id, tags: [eng, urgent] },
    { title: "Set up error monitoring", priority: "medium", due: at(3), userId: sam.id, workspaceId: launch.id, tags: [eng] },
    { title: "Fix date picker on Safari", priority: "high", due: at(-1), userId: sam.id, workspaceId: launch.id, tags: [eng] },
    { title: "Write the launch announcement", priority: "high", due: at(5), userId: jordan.id, workspaceId: launch.id, tags: [marketing] },
    { title: "Prepare demo video script", priority: "low", due: at(7), userId: jordan.id, workspaceId: launch.id, tags: [marketing] },
    { title: "Audit accessibility of sign-in", priority: "medium", due: at(-3), done: true, userId: sam.id, workspaceId: launch.id, tags: [eng, design], completedDaysAgo: 2 },
    { title: "Kick-off meeting notes", priority: "low", due: at(-5), done: true, userId: alex.id, workspaceId: launch.id, completedDaysAgo: 4 },
    { title: "Collect beta feedback", priority: "medium", due: at(-4), done: true, userId: jordan.id, workspaceId: launch.id, tags: [marketing], completedDaysAgo: 1 },
  ];

  const created: Awaited<ReturnType<typeof prisma.task.create>>[] = [];
  for (const t of tasks) {
    created.push(
      await prisma.task.create({
        data: {
          id: randomUUID(),
          title: t.title,
          priority: t.priority,
          dueDate: t.due,
          completed: t.done ?? false,
          userId: t.userId,
          workspaceId: t.workspaceId,
          tags: t.tags ? { connect: t.tags } : undefined,
          createdAt: at(-(t.createdDaysAgo ?? 6), 9),
          updatedAt: t.done ? at(-(t.completedDaysAgo ?? 0), 14) : at(-1, 9),
        },
      }),
    );
  }
  const byTitle = (title: string) => created.find((t) => t.title === title)!;

  // Versions, comments, activity -------------------------------------------
  const pricing = byTitle("Finalize pricing page copy");
  await prisma.taskVersion.createMany({
    data: [
      { taskId: pricing.id, version: 1, description: "First draft of plan names and prices." },
      { taskId: pricing.id, version: 2, description: "Shortened the feature list and added the FAQ." },
    ],
  });

  const pr = byTitle("Review pull request #42");
  await prisma.comment.createMany({
    data: [
      { taskId: pr.id, userId: alex.id, content: "Can we land this before the 3pm sync?" },
      { taskId: pr.id, userId: sam.id, content: "Yes, just waiting on the migration check." },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { taskId: pricing.id, userId: alex.id, action: "Created the task" },
      { taskId: pricing.id, userId: alex.id, action: "Set priority to high" },
      { taskId: pr.id, userId: sam.id, action: "Added tag Engineering" },
    ],
  });

  // Reminders & notifications ----------------------------------------------
  await prisma.reminder.createMany({
    data: [
      { title: "Team sync", body: "Weekly launch check-in.", reminderDate: at(0, 15), userId: alex.id, workspaceId: launch.id },
      { title: "Send invoices", body: null, reminderDate: at(1, 10), userId: alex.id, workspaceId: personal.id },
      { title: "Standup notes", body: null, reminderDate: at(0, 10), userId: sam.id, workspaceId: launch.id },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: alex.id, title: "Task Reminder", body: 'Task "Finalize pricing page copy" is due today.' },
      { userId: alex.id, title: "Task Reminder", body: 'Task "Renew passport" is overdue.' },
      { userId: sam.id, title: "Task Reminder", body: 'Task "Fix date picker on Safari" is overdue.', read: true },
    ],
  });

  console.log(`Seeded ${created.length} tasks across 2 workspaces.`);
  console.log(`Sign in with ${DEMO_EMAILS[0]} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
