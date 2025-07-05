import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export default async function getUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return null;
  }

  return session.user;
}
