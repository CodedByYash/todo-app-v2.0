import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { UserPreferenceSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
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

    return NextResponse.json(createdPreference);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// /app/api/user/preferences/route.ts (continue in same file)

export async function GET() {
  try {
    const user = await getUser();
    if (user?.email || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const preferences = await prisma.userPreference.findUnique({
      where: { userId: existingUser.id },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUser();
    if (!user?.email || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = UserPreferenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.userPreference.update({
      where: { userId: user.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
