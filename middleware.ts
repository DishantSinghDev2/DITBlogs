import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuthenticated = !!token;
    const isOnboardingCompleted = token?.onboardingCompleted as boolean;

    const onboardingUrl = new URL("/onboarding", req.url);
    const dashboardUrl = new URL("/dashboard", req.url);

    // If the user is authenticated
    if (isAuthenticated) {
      // If onboarding is not complete and they are trying to access any page other than onboarding
      if (!isOnboardingCompleted && req.nextUrl.pathname !== "/onboarding") {
        return NextResponse.redirect(onboardingUrl);
      }

      // If onboarding IS complete and they are trying to access the onboarding page
      if (isOnboardingCompleted && req.nextUrl.pathname === "/onboarding") {
        return NextResponse.redirect(dashboardUrl);
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Protect all matched routes
    },
  }
);

// Matcher to specify which routes the middleware should run on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/editor/:path*",
    "/onboarding",
  ],
};