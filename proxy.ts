import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection (Next.js 16 "proxy", formerly middleware).
 *
 * The matcher below deliberately EXCLUDES /api/auth/* — NextAuth's own
 * endpoints (csrf, session, callback/*, signin/*) must be reachable while
 * logged out, otherwise no one can ever sign in.
 */

const PUBLIC_PAGES = ["/", "/auth"];

// APIs a signed-in user may call before finishing onboarding.
const ONBOARDING_EXEMPT_API = ["/api/onboarding", "/api/user/me"];

const isPublicPage = (pathname: string) =>
  PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const isOnboardingExemptApi = (pathname: string) =>
  ONBOARDING_EXEMPT_API.some((p) => pathname === p);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const signedIn = Boolean(token?.id);

  // Public pages: anyone may view them; signed-in users skip the auth forms.
  if (!isApi && isPublicPage(pathname)) {
    if (signedIn && pathname.startsWith("/auth/") && pathname !== "/auth/error") {
      const dest = token?.onboardingCompleted ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (!signedIn) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const onboarded = token?.onboardingCompleted === true;

  if (isApi) {
    if (!onboarded && !isOnboardingExemptApi(pathname)) {
      return NextResponse.json({ error: "Onboarding required" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (!onboarded && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }
  if (onboarded && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except NextAuth endpoints, Next internals and static files.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
