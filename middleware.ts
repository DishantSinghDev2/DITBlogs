import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    if (token) {
      const { membershipStatus } = token;

      // Lock rejected users to /rejected
      if (membershipStatus === "REJECTED" && pathname !== "/rejected") {
        return NextResponse.redirect(new URL("/rejected", req.url));
      }

      // Prevent authenticated users from hitting auth pages
      if (pathname.startsWith("/auth/")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/editor/:path*",
    "/rejected",
  ],
};
