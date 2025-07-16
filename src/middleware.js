import { NextResponse } from "next/server";

export async function middleware(request) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const publicRoutes = ["/sign-in"];

  if (
    publicRoutes.includes(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static") ||
    /\.(.*)$/.test(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/api")
  ) {
    if (accessToken && request.nextUrl.pathname === "/sign-in") {
      return NextResponse.redirect(new URL("/movies", request.url));
    }

    return NextResponse.next();
  }

  if (!accessToken && refreshToken) {
    return NextResponse.next();
  }

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
