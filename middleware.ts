import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    const rejectedUrl = new URL("/rejected", req.url);
    const onboardingUrl = new URL("/onboarding", req.url);
    const dashboardUrl = new URL("/dashboard", req.url);

    if (isAuthenticated) {
      const { onboardingCompleted, membershipStatus, hasInvite } = token;
      const { pathname } = req.nextUrl;

      // State 1: User is onboarded and part of an org
      if (onboardingCompleted) {
        if (pathname === "/onboarding" || pathname === "/rejected") {
          return NextResponse.redirect(dashboardUrl);
        }
        return NextResponse.next(); // Allow access to dashboard etc.
      }

      // State 2: User's request was rejected
      if (membershipStatus === 'REJECTED') {
          if (pathname !== '/rejected') {
              return NextResponse.redirect(rejectedUrl);
          }
          return NextResponse.next();
      }

      // State 3: User is not onboarded
      // Force them to the onboarding page unless they are already there.
      if (pathname !== "/onboarding") {
        return NextResponse.redirect(onboardingUrl);
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Matcher now includes the /rejected page
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/editor/:path*",
    "/onboarding",
    "/rejected", // Add new protected route
  ],
};