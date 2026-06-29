import { NextRequest, NextResponse } from "next/server";

// Next 16: proxy.ts replaces middleware.ts for route protection
// Protected routes require authentication via next-auth session

const protectedPaths = [
  "/dashboard",
  "/assets",
  "/clips",
  "/streams",
  "/analytics",
  "/profile",
  "/billing",
  "/upload",
  "/onboarding",
  "/connect",
];

const authPaths = ["/login", "/signup", "/verify", "/success", "/magic-verify"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|scenes|.*\\.svg).*)",
  ],
};
