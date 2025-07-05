import { prisma } from "@/lib/prisma/prisma";
import { ActivityLogSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = request.json();
    const parsed = ActivityLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const log = await prisma.activityLog.create({
      data: parsed.data,
    });

    return NextResponse.json(log);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  const logs = await prisma.activityLog.findMany({
    where: taskId ? { taskId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json(logs);
}
