import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { updateTagSchema } from "@/lib/schema/schema";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tagId: string } }
) {
  try {
    const user = await getUser();
    const { tagId } = await params;
    if (!user || !user.id || !tagId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = request.json();
    const parsedData = updateTagSchema.safeParse(data);
    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const existingTag = await prisma.tag.findUnique({
      where: {
        id: tagId,
      },
      include: { workspace: { include: { members: true } } },
    });

    if (!existingTag) {
      return new NextResponse("Tag not found", { status: 404 });
    }

    const isMember = existingTag.workspace.members.some(
      (member) => member.userId === user.id
    );
    if (!isMember) {
      return new NextResponse("You are not a member of this workspace", {
        status: 403,
      });
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: parsedData.data,
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tagId: string } }
) {
  try {
    const user = await getUser();
    const { tagId } = await params;

    if (!user || !user.id || !tagId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: { workspace: { include: { members: true } } },
    });

    if (!existingTag) {
      return new NextResponse("Tag not found", { status: 404 });
    }

    const isMember = existingTag.workspace.members.some(
      (member) => member.userId === user.id
    );
    if (!isMember) {
      return new NextResponse("You are not a member of this workspace", {
        status: 403,
      });
    }

    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
