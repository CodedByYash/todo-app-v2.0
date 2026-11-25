import getUser from "@/lib/getUser";
import { prisma } from "@/lib/prisma/prisma";
import { createUserSchema } from "@/lib/schema/schema";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user?.id || id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const parsedData = createUserSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.flatten() },
        { status: 400 },
      );
    }

    const response = await prisma.user.update({
      where: { id: user.id },
      data: parsedData.data,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[PUT_USER]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user?.id || id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_USER]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
