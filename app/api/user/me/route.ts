import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        profilePicture: true,
        bio: true,
        onboardingCompleted: true,
        isPro: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Unable to find profile" },
        { status: 404 },
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("[GET_USER_ME]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
