import { NextResponse } from "next/server";
import type { Tag } from "@/generated/prisma/client";
import getUser from "@/lib/getUser";
import { assertWorkspaceMember } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { updateTagSchema } from "@/lib/schema/schema";
import {
  badRequest,
  forbidden,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type Params = { params: Promise<{ tagId: string }> };

type Loaded = { error: NextResponse } | { tag: Tag };

async function loadTag(userId: string, tagId: string): Promise<Loaded> {
  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) return { error: notFound("Tag not found") };
  if (!(await assertWorkspaceMember(userId, tag.workspaceId))) {
    return { error: forbidden() };
  }
  return { tag };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { tagId } = await params;

    const parsed = updateTagSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const loaded = await loadTag(user.id, tagId);
    if ("error" in loaded) return loaded.error;

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: parsed.data,
    });
    return NextResponse.json(tag);
  } catch (error) {
    return serverError("UPDATE_TAG_BY_ID", error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { tagId } = await params;

    const loaded = await loadTag(user.id, tagId);
    if ("error" in loaded) return loaded.error;

    await prisma.tag.delete({ where: { id: tagId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("DELETE_TAG", error);
  }
}
