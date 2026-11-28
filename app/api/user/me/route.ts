import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { notFound, serverError, unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        bio: true,
        onboardingCompleted: true,
        isPro: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!profile) return notFound("Unable to find profile");

    return NextResponse.json(profile);
  } catch (error) {
    return serverError("GET_USER_ME", error);
  }
}
