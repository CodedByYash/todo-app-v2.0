import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getUser();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const existingUser = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { firstname: { contains: query, mode: "insensitive" } },
              { lastname: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          {
            email: { not: user?.email },
          },
        ],
      },
      skip,
      orderBy: { firstname: "desc" },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        profilePicture: true,
        email: true,
        username: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User does not exists" },
        { status: 404 }
      );
    }

    const total = await prisma.user.count({
      where: {
        AND: [
          {
            OR: [
              { firstname: { contains: query, mode: "insensitive" } },
              { lastname: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          {
            email: { not: user?.email },
          },
        ],
      },
    });
    return NextResponse.json({
      existingUser,
      meta: {
        total,
        page,
        limit,
        totlaPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
