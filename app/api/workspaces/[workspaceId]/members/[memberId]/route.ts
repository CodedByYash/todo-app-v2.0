import { NextResponse } from "next/server";
import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { UpdateMemberRoleSchema } from "@/lib/schema/schema";
import {
  badRequest,
  forbidden,
  notFound,
  readJson,
  serverError,
  unauthorized,
} from "@/lib/api";

type Params = {
  params: Promise<{ workspaceId: string; memberId: string }>;
};

const membershipKey = (userId: string, workspaceId: string) => ({
  userId_workspaceId: { userId, workspaceId },
});

/** DELETE — remove a member (or leave the workspace when memberId is yourself). */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { workspaceId, memberId } = await params;

    const current = await prisma.workspaceMember.findUnique({
      where: membershipKey(user.id, workspaceId),
    });
    if (!current) return forbidden("You are not a member of this workspace");

    const target = await prisma.workspaceMember.findUnique({
      where: membershipKey(memberId, workspaceId),
    });
    if (!target) return notFound("Member not found");

    if (target.role === "OWNER") {
      return forbidden("The owner cannot be removed from the workspace");
    }

    const isSelf = user.id === memberId;
    const canRemove =
      isSelf ||
      current.role === "OWNER" ||
      (current.role === "ADMIN" && target.role !== "ADMIN");
    if (!canRemove) {
      return forbidden("You are not authorized to remove this member");
    }

    await prisma.workspaceMember.delete({
      where: membershipKey(memberId, workspaceId),
    });
    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    return serverError("DELETE_WORKSPACE_MEMBER", error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return unauthorized();
    const { workspaceId, memberId } = await params;

    const parsed = UpdateMemberRoleSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);
    const newRole = parsed.data.role;

    if (user.id === memberId) return badRequest("You can't change your own role");

    const current = await prisma.workspaceMember.findUnique({
      where: membershipKey(user.id, workspaceId),
    });
    if (!current) return forbidden("You are not a member of this workspace");

    const target = await prisma.workspaceMember.findUnique({
      where: membershipKey(memberId, workspaceId),
    });
    if (!target) return notFound("Member not found");

    if (
      (target.role === "OWNER" || newRole === "OWNER") &&
      current.role !== "OWNER"
    ) {
      return forbidden("Only the owner can assign or update the owner role");
    }
    if (current.role === "ADMIN" && (target.role === "ADMIN" || newRole === "ADMIN")) {
      return forbidden("Admins can't modify other admins");
    }
    if (current.role !== "OWNER" && current.role !== "ADMIN") {
      return forbidden();
    }

    await prisma.workspaceMember.update({
      where: membershipKey(memberId, workspaceId),
      data: { role: newRole },
    });
    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error) {
    return serverError("UPDATE_WORKSPACE_MEMBER_ROLE", error);
  }
}
