import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma/prisma";
import { signinSchema } from "@/lib/schema/schema";
import { createUser, normalizeEmail } from "@/lib/auth/users";

// Compared against when the email is unknown so response time doesn't reveal
// whether an account exists.
const DUMMY_HASH =
  "$2b$12$Gwc1UNxq7RqUWM/G6oXu9uHNjpUfg8JqbHQqRUAFTsKou4Bx0nXby";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = signinSchema.safeParse(credentials);
      if (!parsed.success) throw new Error("Invalid email or password");

      const email = normalizeEmail(parsed.data.email);
      const user = await prisma.user.findUnique({ where: { email } });

      const valid = await compare(
        parsed.data.password,
        user?.password ?? DUMMY_HASH,
      );
      if (!user || !user.password || !valid) {
        throw new Error("Invalid email or password");
      }

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  );
}

/** Which OAuth providers are configured (used by the sign-in UI). */
export const enabledOAuthProviders = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
};

export const authOptions: NextAuthOptions = {
  // JWT sessions: no session table, works on serverless/edge-less Vercel.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers,
  pages: { signIn: "/auth/signin", error: "/auth/error" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;

      const email = user.email ? normalizeEmail(user.email) : null;
      if (!email) return "/auth/error?error=NoEmail";

      // Only link / create accounts for emails the provider has verified.
      if (account.provider === "google") {
        const verified = (profile as { email_verified?: boolean } | undefined)
          ?.email_verified;
        if (!verified) return "/auth/error?error=EmailNotVerified";
      }

      try {
        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          dbUser = await createUser({
            email,
            name: user.name,
            image: user.image,
            emailVerified: true,
          });
        } else if (!dbUser.profilePicture && user.image) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { profilePicture: user.image },
          });
        }

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            id_token: account.id_token,
          },
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        });
        return true;
      } catch (error) {
        console.error("[auth] OAuth sign-in failed", error);
        return "/auth/error?error=Callback";
      }
    },

    async jwt({ token, user, trigger }) {
      // First call after sign-in: resolve the database user (works for both
      // credentials and OAuth because both are keyed by email).
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizeEmail(user.email) },
          select: { id: true, onboardingCompleted: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.onboardingCompleted = dbUser.onboardingCompleted;
        }
      }

      // `update()` from the client never carries trusted data: re-read the DB.
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { onboardingCompleted: true, name: true },
        });
        token.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
        if (dbUser?.name) token.name = dbUser.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.onboardingCompleted = token.onboardingCompleted ?? false;
      }
      return session;
    },
  },
};
