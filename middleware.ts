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

      // Redirect fully-onboarded users away from /onboarding and /rejected.
      // Use token.organizationId as a belt-and-suspenders fallback in case
      // onboardingCompleted wasn't written to the JWT yet.
      if (onboardingCompleted || token.organizationId) {
        if (pathname === "/onboarding" || pathname === "/rejected") {
          return NextResponse.redirect(dashboardUrl);
        }
      }

      // Lock rejected users to the /rejected page.
      if (membershipStatus === "REJECTED" && pathname !== "/rejected") {
        return NextResponse.redirect(new URL("/rejected", req.url));
      }

      // Do NOT redirect to /onboarding here. The middleware only reads a
      // cached JWT cookie and can't distinguish a genuinely un-onboarded user
      // from one whose cookie is stale. The dashboard layout does a live DB
      // check and handles the redirect to /onboarding correctly.
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