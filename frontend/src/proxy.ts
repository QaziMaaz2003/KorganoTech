import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "kt_session";

/** Reads the role claim without verifying the signature — the API does that. */
function roleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return (JSON.parse(json) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

/**
 * Fast redirects for signed-out visitors and non-admins. This is a UX layer
 * only: every protected API route is authorized by the NestJS backend.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && roleFromToken(token) !== "ADMIN") {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // /api is deliberately excluded so uploads stream straight to the backend.
  matcher: ["/account/:path*", "/admin/:path*"],
};
