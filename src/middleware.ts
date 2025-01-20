import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Utility function to check if a route is public
const isPublicRoute = (pathname: string, publicRoutes: string[]) => {
  return publicRoutes.some((route) => pathname.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request }); // Get the token (if any)
  const { pathname } = request.nextUrl; // Extract the pathname

  const publicRoutes = ["/u/[username]", "/", "/api/public"]; // Add public routes here

  // Allow public routes without authentication
  if (isPublicRoute(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/signUp", request.url));
  }

  // Redirect authenticated users away from auth pages
  const authPages = ["/sign-in", "/signUp", "/verify"];
  if (isPublicRoute(pathname, authPages)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configuration for matching routes
export const config = {
  matcher: [
    "/public",
    "/dashboard/:path*", // Protect all dashboard routes
    "/sign-in",
    "/signUp",
    "/verify",
  ],
};
