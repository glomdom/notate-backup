import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PAGES = [
  "/dashboard",
  "/admin",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (
    PROTECTED_PAGES.some((path) => {
      request.nextUrl.pathname.startsWith(path)
    }) && !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin:path*"],
};
