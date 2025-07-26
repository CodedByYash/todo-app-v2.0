import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, workspacename, description, type } = await req.json();

    if (!userId || !workspacename || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.workspace.create({
        data: {
          workspacename,
          description,
          type,
          ownerId: userId,
          users: { connect: { id: userId } },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
