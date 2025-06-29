import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { createUserSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const user = await getUser();

    if (!id || !user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id, email: user.email },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "unable to find profile" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const user = await getUser();
  const data = request.json();
  const parsedData = createUserSchema.safeParse(data);

  if (!parsedData.success) {
    return NextResponse.json({ error: "invalid data" }, { status: 401 });
  }

  if (!id || !user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id, email: user.email },
  });

  if (!userProfile) {
    return NextResponse.json(
      { error: "unable to find profile" },
      { status: 404 }
    );
  }

  const response = await prisma.user.update({
    where: { id, email: user.email },
    data: parsedData.data,
  });

  return NextResponse.json(response);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const user = await getUser();

  if (!id || !user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id, email: user.email },
  });

  if (existingUser) {
    const response = await prisma.user.delete({
      where: { id, email: user.email },
    });

    return NextResponse.json(response);
  }

  return NextResponse.json({ error: "User does not exists" }, { status: 404 });
}
