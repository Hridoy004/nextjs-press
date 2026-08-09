import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
// const PUBLIC_ROUTES = ["/", "news", "/login", "/register"];
const PUBLIC_ROUTES = ["/", "news"];

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  //   const cookieStore = await cookies();
  //   const accessToken = request.cookies.get("accessToken");

  const accessToken = request.cookies.get("accessToken")?.value;

  const decodedToken = accessToken
    ? (jwt.decode(accessToken) as JwtPayload)
    : null;

  let userRole = null;

  if (decodedToken) {
    userRole = decodedToken.role;
  }

  if (accessToken && AUTH_ROUTES.includes(pathname)) {
    if (userRole === "USER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    } else if (userRole === "AUTHOR") {
      return NextResponse.redirect(new URL("/author-dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Authentication pages protection
  if (!accessToken && !isPublic && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  //   return NextResponse.redirect(new URL("/home", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/dashboard/:path*",
    // "/admin-dashboard/:path*",
    "/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)",
  ],
};
