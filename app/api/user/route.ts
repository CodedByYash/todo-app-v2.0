import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { createUserSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search");

    if (query) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { firstname: { contains: query, mode: "insensitive" } },
            { lastname: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          profilePicture: true,
          username: true,
        },
      });
      return NextResponse.json(users);
    }
    return NextResponse.json({ error: "Search query required" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsedData = createUserSchema.safeParse(data);
    const user = await getUser();

    if (!parsedData.success || !user || !user.email) {
      return NextResponse.json({ error: "invalid data" }, { status: 401 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: user?.email },
    });

    if (!existingUser) {
      const response = await prisma.user.create({
        data: parsedData.data,
      });

      return NextResponse.json(response);
    }
    return NextResponse.json({ error: "user already exists" }, { status: 409 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { theme } = await request.json();

    // Update user in Prisma
    await prisma.userPreference.update({
      where: { userId: user.id },
      data: { theme },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
