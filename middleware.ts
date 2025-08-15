// /middleware.ts

import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    const { pathname } = req.nextUrl;
    const dashboardUrl = new URL("/dashboard", req.url);

    // If the user is not authenticated, withAuth will handle the redirect
    // to the sign-in page automatically. We only need to handle logic
    // for authenticated users.
    if (isAuthenticated) {
      const { onboardingCompleted, membershipStatus } = token;

      // State 1: User is fully onboarded and has an active membership.
      // They should be able to access the app but not the onboarding/rejected pages.
      if (onboardingCompleted) {
        if (pathname === "/onboarding" || pathname === "/rejected") {
          return NextResponse.redirect(dashboardUrl);
        }
      }
      // State 2: User's request to join was rejected.
      // They should be locked to the /rejected page.
      else if (membershipStatus === 'REJECTED') {
        if (pathname !== '/rejected') {
          return NextResponse.redirect(new URL("/rejected", req.url));
        }
      }
      // State 3: User is authenticated but NOT onboarded yet.
      // They should be locked to the /onboarding page.
      else {
        if (pathname !== "/onboarding") {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
      }
    }

    // If none of the above conditions for an authenticated user are met,
    // or if the user is unauthenticated (handled by withAuth), allow the request to proceed.
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback is used by the withAuth HOC to determine if the user is authorized.
      authorized: ({ token }) => !!token,
    },
  }
);

// Matcher remains the same, as it correctly identifies the protected routes.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/editor/:path*",
    "/onboarding",
    "/rejected",
  ],
};