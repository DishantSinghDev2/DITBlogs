import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/jwt"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/auth/error?error=missing-token", req.url))
  }

  try {
    const payload = await verifyToken(token)

    if (!payload || !payload.email) {
      return NextResponse.redirect(new URL("/auth/error?error=invalid-token", req.url))
    }

    const user = await db.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.redirect(new URL("/auth/error?error=user-not-found", req.url))
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    return NextResponse.redirect(new URL("/auth/login?verified=true", req.url))
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=verification-failed", req.url))
  }
}
