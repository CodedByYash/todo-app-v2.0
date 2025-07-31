import { hash } from "bcryptjs";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "user1",
        email: "alice@example.com",
        username: "alice",
        password: await hash("password123", 10),
        firstname: "Alice",
        lastname: "Smith",
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        id: "user2",
        email: "bob@example.com",
        username: "bob",
        password: await hash("password123", 10),
        firstname: "Bob",
        lastname: "Johnson",
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        id: "user3",
        email: "charlie@example.com",
        username: "charlie",
        password: await hash("password123", 10),
        firstname: "Charlie",
        lastname: "Brown",
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create Workspaces
  const workspaces = await Promise.all([
    prisma.workspace.create({
      data: {
        id: "ws1",
        workspacename: "Project Alpha",
        type: "PROFESSIONAL",
        ownerId: users[0].id,
        workspaceSize: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.workspace.create({
      data: {
        id: "ws2",
        workspacename: "Project Beta",
        type: "PERSONAL",
        ownerId: users[1].id,
        workspaceSize: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create UserPreferences
  await Promise.all([
    prisma.userPreference.create({
      data: {
        id: "pref1",
        userId: users[0].id,
        defaultWorkspaceId: workspaces[0].id,
        theme: "LIGHT",
        receiveEmailNotifications: true,
        defaultWorkspaceView: "KANBAN",
        enableTaskAutoSave: true,
        language: "en",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.userPreference.create({
      data: {
        id: "pref2",
        userId: users[1].id,
        defaultWorkspaceId: workspaces[1].id,
        theme: "DARK",
        receiveEmailNotifications: false,
        defaultWorkspaceView: "LIST",
        enableTaskAutoSave: true,
        language: "en",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.userPreference.create({
      data: {
        id: "pref3",
        userId: users[2].id,
        defaultWorkspaceId: workspaces[0].id,
        theme: "SYSTEM",
        receiveEmailNotifications: true,
        defaultWorkspaceView: "CALENDAR",
        enableTaskAutoSave: false,
        language: "en",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create WorkspaceMembers
  await Promise.all([
    prisma.workspaceMember.create({
      data: {
        id: "wm1",
        userId: users[0].id,
        workspaceId: workspaces[0].id,
        role: "OWNER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.workspaceMember.create({
      data: {
        id: "wm2",
        userId: users[1].id,
        workspaceId: workspaces[0].id,
        role: "MEMBER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.workspaceMember.create({
      data: {
        id: "wm3",
        userId: users[2].id,
        workspaceId: workspaces[0].id,
        role: "MEMBER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.workspaceMember.create({
      data: {
        id: "wm4",
        userId: users[1].id,
        workspaceId: workspaces[1].id,
        role: "OWNER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.workspaceMember.create({
      data: {
        id: "wm5",
        userId: users[0].id,
        workspaceId: workspaces[1].id,
        role: "MEMBER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create Tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        id: "tag1",
        name: "Urgent",
        color: "#ef4444",
        workspaceId: workspaces[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.tag.create({
      data: {
        id: "tag2",
        name: "Design",
        color: "#10b981",
        workspaceId: workspaces[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.tag.create({
      data: {
        id: "tag3",
        name: "Planning",
        color: "#3b82f6",
        workspaceId: workspaces[1].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create Tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  await Promise.all([
    prisma.task.create({
      data: {
        id: "task1",
        title: "Design Homepage",
        completed: false,
        priority: "high",
        dueDate: tomorrow,
        userId: users[0].id,
        workspaceId: workspaces[0].id,
        tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.task.create({
      data: {
        id: "task2",
        title: "Backend API Setup",
        completed: false,
        priority: "medium",
        dueDate: today,
        userId: users[1].id,
        workspaceId: workspaces[0].id,
        tags: { connect: [{ id: tags[1].id }] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.task.create({
      data: {
        id: "task3",
        title: "User Testing",
        completed: true,
        priority: "low",
        dueDate: yesterday,
        userId: users[2].id,
        workspaceId: workspaces[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.task.create({
      data: {
        id: "task4",
        title: "Marketing Plan",
        completed: false,
        priority: "no_priority",
        dueDate: tomorrow,
        userId: users[0].id,
        workspaceId: workspaces[1].id,
        tags: { connect: [{ id: tags[2].id }] },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.task.create({
      data: {
        id: "task5",
        title: "Database Optimization",
        completed: false,
        priority: "high",
        dueDate: today,
        userId: users[1].id,
        workspaceId: workspaces[1].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        id: "notif1",
        userId: users[0].id,
        title: "Task Due Soon",
        body: "Design Homepage is due tomorrow.",
        read: false,
        createdAt: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        id: "notif2",
        userId: users[1].id,
        title: "Task Assigned",
        body: "You’ve been assigned to Backend API Setup.",
        read: true,
        createdAt: new Date(),
      },
    }),
  ]);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
