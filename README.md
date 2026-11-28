# Taskito

A task manager with workspaces, tags, reminders, comments, attachments and team roles.
Next.js 16 · React 19 · TypeScript · Tailwind v4 · Prisma 7 + Postgres · NextAuth v4.

## Run locally

```bash
cp .env.example .env        # fill in DATABASE_URL and NEXTAUTH_SECRET at minimum
npm install
npm run db:migrate          # prisma migrate deploy
npm run db:seed             # demo data
npm run dev
```

Demo logins (after seeding), password `Password123!`:
`alex@taskito.dev`, `sam@taskito.dev`, `jordan@taskito.dev`.

## Sign-in

Email + password, Google and GitHub. Google/GitHub buttons appear only when their env vars are set.
Create the OAuth apps and use these callback URLs:

- Google: `{NEXTAUTH_URL}/api/auth/callback/google`
- GitHub: `{NEXTAUTH_URL}/api/auth/callback/github`

Add one for `http://localhost:3000` and one for your Vercel domain.

## Deploy to Vercel

1. Create a hosted Postgres (Neon, Supabase, Vercel Postgres).
2. Import the repo in Vercel and set the env vars from `.env.example`:
   `DATABASE_URL`, `DIRECT_URL` (non-pooled, used for migrations), `NEXTAUTH_SECRET`
   (`openssl rand -base64 32`), `NEXTAUTH_URL` (your production URL), `GOOGLE_CLIENT_ID/SECRET`,
   `GITHUB_CLIENT_ID/SECRET`, `CRON_SECRET`, and the `AWS_*` S3 vars if you use attachments.
3. Deploy. `vercel.json` runs `prisma generate && prisma migrate deploy && next build`
   and schedules `/api/cron/reminders` (protected by `CRON_SECRET`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` / `lint` | `tsc --noEmit` / ESLint |
| `npm test` | Unit tests, plus integration tests when `DATABASE_URL` points at a throwaway Postgres |
| `npm run db:migrate:dev` | Create a new migration in development |
| `npm run db:seed` | Idempotent demo data |
