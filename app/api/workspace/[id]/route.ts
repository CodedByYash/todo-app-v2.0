import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUser();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: params.id,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      owner: true,
      members: { include: { user: true } },
    },
  });

  if (!workspace) {
    return NextResponse.json(
      { message: "workspace creation failed" },
      { status: 401 }
    );
  }

  return NextResponse.json(workspace);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = await getUser();
}
