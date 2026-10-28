import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Allow public routes without authentication checks
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/design" ||
    pathname === "/emulator" ||
    pathname === "/discover" ||
    pathname === "/explore" ||
    pathname.startsWith("/discover/") ||
    pathname.startsWith("/resources/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".");

  if (isPublicRoute) {
    return await updateSession(request);
  }

  // 2. Check for active session or demo role cookie
  const demoRole = request.cookies.get("commons_demo_role")?.value;
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  const isAuthenticated = !!demoRole || hasSupabaseCookie;

  // 3. Unauthenticated access redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based route protection
  const effectiveRole = demoRole || "student";

  // Students attempting to access owner/manager queues
  if (
    effectiveRole === "student" &&
    (pathname.startsWith("/admin/") || pathname.startsWith("/owner/") || pathname === "/queue")
  ) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  // Owners/managers accessing student-only onboarding
  if (
    (effectiveRole === "owner" || effectiveRole === "manager" || effectiveRole === "admin") &&
    pathname === "/onboarding"
  ) {
    return NextResponse.redirect(new URL("/admin/credentials", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
