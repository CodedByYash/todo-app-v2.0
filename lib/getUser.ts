import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export default async function getUser(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      throw new Error("Unauthorized");
    }

    return session.user.id;
  } catch (error) {
    throw new Error("Server side error");
  }
}
