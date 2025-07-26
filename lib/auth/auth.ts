import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma/prisma";
import { compare, hash } from "bcryptjs";
import { User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

interface CustomUser extends User {
  id: string;
  username?: string;
  onboardingCompleted?: boolean;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        firstname: { label: "First Name", type: "text" },
        lastname: { label: "Last Name", type: "text" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (credentials.username) {
          // Signup flow
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { username: credentials.username },
              ],
            },
          });
          if (existingUser) {
            throw new Error("Email or username already exists");
          }

          const hashedPassword = await hash(credentials.password, 10);
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              username: credentials.username,
              firstname: credentials.firstname,
              lastname: credentials.lastname,
              password: hashedPassword,
              onboardingCompleted: false,
            },
          });

          return {
            id: user.id,
            email: user.email,
            username: user.username ?? undefined,
            onboardingCompleted: user.onboardingCompleted,
          };
        } else {
          // Signin flow
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) return null;

          const isValid = await compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            username: user.username ?? undefined,
            onboardingCompleted: user.onboardingCompleted,
          };
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          username: profile.email.split("@")[0],
          name: profile.name,
          onboardingCompleted: false,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          email: profile.email || `${profile.login}@github.com`,
          username: profile.login,
          name: profile.name,
          onboardingCompleted: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = (user as CustomUser).username;
        token.onboardingCompleted = (user as CustomUser).onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email!;
        session.user.username = token.username;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in or sign-up, redirect to base URL
      // Client-side components will handle onboarding check
      if (url.includes("sign-in") || url.includes("sign-up")) {
        return baseUrl;
      }
      return url;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
