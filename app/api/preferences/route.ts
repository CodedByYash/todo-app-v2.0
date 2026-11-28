import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import getUser from "@/lib/getUser";
import { canAccessWorkspace } from "@/lib/auth-guards";
import {
  badRequest,
  forbidden,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";
import { z } from "zod";

const patchSchema = z
  .object({
    defaultWorkspaceId: z.uuid().nullable().optional(),
    theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  })
  .refine((v) => v.defaultWorkspaceId !== undefined || v.theme !== undefined, {
    message: "Nothing to update",
  });

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const preference = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json(preference ?? {});
  } catch (error) {
    return serverError("GET_PREFERENCES", error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = patchSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const { defaultWorkspaceId, theme } = parsed.data;

    if (
      defaultWorkspaceId &&
      !(await canAccessWorkspace(user.id, defaultWorkspaceId))
    ) {
      return forbidden("Invalid or inaccessible workspace");
    }

    const changes = {
      ...(defaultWorkspaceId !== undefined && { defaultWorkspaceId }),
      ...(theme !== undefined && { theme }),
    };
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: changes,
      create: { userId: user.id, ...changes },
    });
    return NextResponse.json({ message: "Preferences updated" });
  } catch (error) {
    return serverError("PATCH_PREFERENCES", error);
  }
}
