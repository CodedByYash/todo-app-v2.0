import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import getUser from "@/lib/getUser";
import { assertWorkspaceMember } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma/prisma";
import { tagSchema, tagUpdateSchema } from "@/lib/schema/schema";
import {
  badRequest,
  forbidden,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

const duplicateTag = () =>
  NextResponse.json(
    { error: "A tag with this name already exists in the workspace" },
    { status: 409 },
  );

const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = tagSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    if (!(await assertWorkspaceMember(user.id, parsed.data.workspaceId))) {
      return forbidden();
    }

    const tag = await prisma.tag.create({ data: parsed.data });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) return duplicateTag();
    return serverError("CREATE_TAG", error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const workspaceId = new URL(request.url).searchParams.get("workspaceId");
    if (!workspaceId) return badRequest("Missing workspaceId");

    if (!(await assertWorkspaceMember(user.id, workspaceId))) return forbidden();

    const tags = await prisma.tag.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tags);
  } catch (error) {
    return serverError("GET_TAGS", error);
  }
}

/** PATCH — move a tag to another workspace the user belongs to. */
export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();

    const parsed = tagUpdateSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const existing = await prisma.tag.findUnique({
      where: { id: parsed.data.tagId },
    });
    if (!existing) return notFound("Tag not found");

    if (!(await assertWorkspaceMember(user.id, existing.workspaceId))) {
      return forbidden();
    }
    if (
      parsed.data.workspaceId &&
      !(await assertWorkspaceMember(user.id, parsed.data.workspaceId))
    ) {
      return forbidden();
    }

    const tag = await prisma.tag.update({
      where: { id: parsed.data.tagId },
      data: parsed.data.workspaceId
        ? { workspaceId: parsed.data.workspaceId, tasks: { set: [] } }
        : {},
    });
    return NextResponse.json(tag);
  } catch (error) {
    if (isUniqueViolation(error)) return duplicateTag();
    return serverError("UPDATE_TAG", error);
  }
}
