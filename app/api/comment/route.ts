import { prisma } from "@/lib/prisma/prisma";
import { CommentSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: parsed.data,
    include: { user: true },
  });

  return NextResponse.json(comment);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}
