/**
 * Middleware Configuration
 * In mock mode (USE_MOCK_DATA=true): all routes are public, no Clerk needed.
 * In production mode: Clerk handles authentication and route protection.
 */

import { NextResponse, type NextRequest } from "next/server";

const isMockMode = process.env.USE_MOCK_DATA === "true";

// ── Mock mode: skip Clerk entirely ───────────────────────────────────────────
async function mockMiddleware(_req: NextRequest) {
  return NextResponse.next();
}

// ── Production mode: Clerk-protected routes ───────────────────────────────────
async function clerkProtectedMiddleware(req: NextRequest) {
  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );

  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/api/public(.*)",
  ]);

  const isIgnoredRoute = createRouteMatcher([
    "/_next(.*)",
    "/static(.*)",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ]);

  return clerkMiddleware(async (auth, request) => {
    if (isIgnoredRoute(request)) return NextResponse.next();
    if (isPublicRoute(request)) return NextResponse.next();

    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  })(req, {} as any);
}

export default function middleware(req: NextRequest) {
  if (isMockMode) return mockMiddleware(req);
  return clerkProtectedMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

