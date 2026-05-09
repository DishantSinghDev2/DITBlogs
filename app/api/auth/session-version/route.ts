import { db } from "@/lib/db"
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/session-version
 *
 * Lightweight endpoint polled by clients every ~15 seconds.
 * Reads the current sessionVersion from the DB and compares it with the
 * value embedded in the caller's JWT cookie. Returns { outdated: true }
 * when they differ so the client can call update() to force a full
 * JWT re-fetch (which picks up the new role from the DB).
 *
 * No body, no heavy queries — just one integer column read per poll.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ outdated: false })
    }

    const userId = (token.id ?? token.sub) as string
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { sessionVersion: true },
    })

    if (!dbUser) return NextResponse.json({ outdated: false })

    const tokenVersion = (token.sessionVersion as number) ?? 1
    const outdated = dbUser.sessionVersion !== tokenVersion

    return NextResponse.json({ outdated })
  } catch (err) {
    console.error("[SESSION_VERSION]", err)
    return NextResponse.json({ outdated: false })
  }
}
