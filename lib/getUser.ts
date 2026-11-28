import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

/** Returns the signed-in user from the session, or null. */
export default async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}
