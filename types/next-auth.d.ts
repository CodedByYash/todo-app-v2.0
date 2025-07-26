import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      onboardingCompleted?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username?: string;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    onboardingCompleted?: boolean;
  }
}
