import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { canAccessWorkspace } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { reminderSchema } from "@/lib/schema/schema";
import {
  badRequest,
  forbidden,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      orderBy: { reminderDate: "asc" },
    });
    return NextResponse.json(reminders);
  } catch (error) {
    return serverError("GET_REMINDERS", error);
  }
}

/** Marks a reminder complete. The id comes from ?id= or the JSON body. */
async function markComplete(request: Request, userId: string) {
  let id = new URL(request.url).searchParams.get("id");
  if (!id) {
    const body = (await readJson(request)) as { id?: unknown } | null;
    id = typeof body?.id === "string" ? body.id : null;
  }
  if (!id) return badRequest("Missing reminder id");

  const result = await prisma.reminder.updateMany({
    where: { id, userId },
    data: { completed: true },
  });
  if (result.count === 0) return notFound("Reminder not found");
  return NextResponse.json({ success: true });
}

async function complete(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    return await markComplete(request, user.id);
  } catch (error) {
    return serverError("UPDATE_REMINDER", error);
  }
}

export const PATCH = complete;
export const PUT = complete;

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = reminderSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const data = parsed.data;

    if (!(await canAccessWorkspace(user.id, data.workspaceId))) {
      return forbidden("Invalid or inaccessible workspace");
    }

    const reminder = await prisma.reminder.create({
      data: {
        title: data.title,
        body: data.body ?? null,
        reminderDate: new Date(data.reminderDate),
        userId: user.id,
        workspaceId: data.workspaceId,
        completed: data.completed ?? false,
      },
    });
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    return serverError("CREATE_REMINDER", error);
  }
}
