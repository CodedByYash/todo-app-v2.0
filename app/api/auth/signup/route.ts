import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/schema/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = signupSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ error: "invalid message" }, { status: 401 });
    }

    const { email, password, name } = parsedBody.data;

    if (!email || !password || !name) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return Response.json({
      message: "User created successfully",
      userId: user.id,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
