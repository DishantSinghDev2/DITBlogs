import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Verify token
    const payload = await verifyToken(token)

    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Update subscriber status
    await db.newsletter.update({
      where: { email: payload.email },
      data: { active: false },
    })

    // Clear cache
    await redis.del("newsletter_stats")

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(new URL("/newsletter/unsubscribed", req.url))
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }
}
