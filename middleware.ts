import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const middleware = withAuth(
    function middleware(req) {
        const { role } = req.nextauth.token || {};

        // Allow only 'editor' and 'admin' roles to access /dashboard pages
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
            if (role !== "editor" && role !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Ensure the user is authenticated
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"], // Apply middleware to /dashboard and its subpaths
};