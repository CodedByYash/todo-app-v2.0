import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { badRequest, publicUserSelect, serverError, unauthorized } from "@/lib/api";
import { z } from "zod";

const querySchema = z.object({
  query: z.string().trim().min(1).max(100),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      query: searchParams.get("query") ?? "",
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) return badRequest(parsed.error);
    const { query, page, limit } = parsed.data;

    const where = {
      id: { not: user.id },
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { email: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [existingUser, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
        select: publicUserSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      existingUser,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError("USER_SEARCH", error);
  }
}
