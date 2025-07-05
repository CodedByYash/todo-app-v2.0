import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { createUserSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = await getUser();
    const data = request.json();
    const parsedData = createUserSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json({ error: "invalid data" }, { status: 401 });
    }

    if (!userId || !user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: userId, email: user.email! },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "unable to find profile" },
        { status: 404 }
      );
    }

    const response = await prisma.user.update({
      where: { id: userId, email: user.email! },
      data: parsedData.data,
    });

    if (!response) {
      return NextResponse.json(
        { message: "Unable to update" },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const id = params.userId;
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

    return NextResponse.json(
      { error: "User does not exists" },
      { status: 404 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
