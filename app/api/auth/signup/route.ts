import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { signupSchema } from "@/lib/schema/schema";
import { badRequest, readJson, serverError } from "@/lib/api";
import { createUser, normalizeEmail } from "@/lib/auth/users";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error);

    const email = normalizeEmail(parsed.data.email);

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const user = await createUser({ email, password: parsed.data.password });
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    // Two simultaneous signups with the same email: unique constraint.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    return serverError("SIGNUP", error);
  }
}
