import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { onboardingSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { workspacename, description, type } = parsed.data;

    const existing = await prisma.workspace.findFirst({
      where: { ownerId: user.id },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      });
      return NextResponse.json({ success: true, workspace: existing });
    }

    const workspace = await prisma.$transaction(async (tx) => {
      const created = await tx.workspace.create({
        data: {
          workspacename,
          description,
          type,
          ownerId: user.id,
          users: { connect: { id: user.id } },
        },
      });

      await tx.workspaceMember.create({
        data: {
          role: "OWNER",
          userId: user.id,
          workspaceId: created.id,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      });

      return created;
    });

    return NextResponse.json({ success: true, workspace });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
