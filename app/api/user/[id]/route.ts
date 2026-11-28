import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { updateProfileSchema } from "@/lib/schema/schema";
import {
  badRequest,
  forbidden,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) return unauthorized();
    if (id !== user.id) return forbidden();

    const parsed = updateProfileSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, bio: true, profilePicture: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return serverError("PUT_USER", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getUser();
    if (!user) return unauthorized();
    if (id !== user.id) return forbidden();

    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("DELETE_USER", error);
  }
}
