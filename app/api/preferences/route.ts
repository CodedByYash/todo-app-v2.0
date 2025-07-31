import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const preference = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json(preference || {}, { status: 200 });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { defaultWorkspaceId } = await request.json();
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: { defaultWorkspaceId },
      create: {
        userId: user.id,
        defaultWorkspaceId,
        receiveEmailNotifications: true,
        defaultWorkspaceView: "KANBAN",
        enableTaskAutoSave: true,
        language: "en",
        theme: "SYSTEM",
      },
    });
    return NextResponse.json({ message: "Preferences updated" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
