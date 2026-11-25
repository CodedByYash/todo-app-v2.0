import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { UserPreferenceSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingPreferences = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    if (existingPreferences) {
      return NextResponse.json(existingPreferences);
    }

    const createdPreference = await prisma.userPreference.create({
      data: { userId: user.id },
    });

    return NextResponse.json(createdPreference, { status: 201 });
  } catch (error) {
    console.error("[POST_USER_PREFERENCES]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("[GET_USER_PREFERENCES]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UserPreferenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await prisma.userPreference.update({
      where: { userId: user.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT_USER_PREFERENCES]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
