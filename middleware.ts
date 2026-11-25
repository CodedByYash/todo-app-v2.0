import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PAGE_PATHS = ["/", "/auth/signin", "/auth/signup", "/auth/error"];

const ONBOARDING_EXEMPT_API = ["/api/onboarding", "/api/auth"];

function isPublicPage(pathname: string) {
  return PUBLIC_PAGE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isOnboardingExemptApi(pathname: string) {
  return ONBOARDING_EXEMPT_API.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const onboardingCompleted = token.onboardingCompleted === true;

  if (
    !onboardingCompleted &&
    pathname !== "/onboarding" &&
    !pathname.startsWith("/api/") &&
    !isOnboardingExemptApi(pathname)
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (
    onboardingCompleted &&
    pathname === "/onboarding" &&
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    pathname.startsWith("/api/") &&
    !onboardingCompleted &&
    !isOnboardingExemptApi(pathname)
  ) {
    return NextResponse.json(
      { error: "Onboarding required" },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/calendar/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/notification/:path*",
    "/onboarding",
    "/api/:path*",
  ],
};
