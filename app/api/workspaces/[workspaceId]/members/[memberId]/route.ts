import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { UpdateMemberRoleSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  try {
    const user = await getUser();
    const workspaceId = params.workspaceId;
    const memberId = params.memberId;
    if (!user || !user.id || !workspaceId || !memberId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is the owner of the workspace
    const currentMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!currentMembership) {
      return new NextResponse("Member not found", { status: 403 });
    }

    const targetMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
    });

    if (!targetMembership) {
      return new NextResponse("Member not found", { status: 403 });
    }

    if (targetMembership.role === "OWNER" && user.id === memberId) {
      return new NextResponse("Cannot remove the owner of the workspace", {
        status: 403,
      });
    }

    const canRemove =
      currentMembership.role === "OWNER" ||
      (currentMembership.role === "ADMIN" &&
        targetMembership.role === "MEMBER");

    if (!canRemove) {
      return new NextResponse("You are not authorized to remove this member", {
        status: 403,
      });
    }

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("[DELETE_WORKSPACE_MEMBER]", err);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
) {
  try {
    const user = await getUser();
    const workspaceId = params.workspaceId;
    const memberId = params.memberId;
    const body = await request.json();
    const parsedBody = UpdateMemberRoleSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const newRole = parsedBody.data.role;

    if (!user || !user.id || !workspaceId || !memberId || !newRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!currentMembership) {
      return new NextResponse("Member not found", { status: 403 });
    }

    const targetMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
    });

    if (!targetMembership) {
      return new NextResponse("Member not found", { status: 403 });
    }

    const currentRole = currentMembership.role;
    const targetRole = targetMembership.role;

    if (targetRole === "OWNER" || newRole === "OWNER") {
      if (currentRole !== "OWNER") {
        return new NextResponse("Only owner can assign or update owner role", {
          status: 403,
        });
      }
    }

    if (
      currentRole === "ADMIN" &&
      (targetRole === "ADMIN" || newRole === "ADMIN")
    ) {
      return new NextResponse("Admins can't modify other admins", {
        status: 403,
      });
    }

    if (user.id === memberId) {
      return new NextResponse("You can't change your own role", {
        status: 400,
      });
    }

    await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId,
        },
      },
      data: {
        role: newRole,
      },
    });

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("[UPDATE_WORKSPACE_MEMBER_ROLE]", err);
  }
}
