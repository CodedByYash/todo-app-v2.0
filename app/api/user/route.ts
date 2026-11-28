import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { updateProfileSchema } from "@/lib/schema/schema";
import {
  badRequest,
  publicUserSelect,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";
import { z } from "zod";

const searchSchema = z.object({ search: z.string().trim().min(1).max(100) });

/** GET /api/user?search=term — find users by name or email. */
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse({ search: searchParams.get("search") });
    if (!parsed.success) return badRequest("Search query required");

    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          { name: { contains: parsed.data.search, mode: "insensitive" } },
          { email: { contains: parsed.data.search, mode: "insensitive" } },
        ],
      },
      select: publicUserSelect,
      take: 20,
    });
    return NextResponse.json(users);
  } catch (error) {
    return serverError("SEARCH_USERS", error);
  }
}

const settingsSchema = updateProfileSchema.extend({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
});

/** PUT /api/user — update the signed-in user's profile and theme. */
export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = settingsSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const { theme, ...profile } = parsed.data;

    const [updated] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: profile,
        select: { id: true, name: true, email: true, bio: true },
      }),
      ...(theme
        ? [
            prisma.userPreference.upsert({
              where: { userId: user.id },
              update: { theme },
              create: { userId: user.id, theme },
            }),
          ]
        : []),
    ]);
    return NextResponse.json(updated);
  } catch (error) {
    return serverError("UPDATE_USER", error);
  }
}
