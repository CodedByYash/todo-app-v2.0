import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function getUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return null;
  }

  return session.user;
}
