import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { checkUserRole } from "@/lib/api/user"

// GET handler for fetching all settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(session.user.id, "admin")

    if (!isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Get all settings
    const settings = await db.siteConfig.findMany()

    // Transform to key-value object
    const settingsObject = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, any>,
    )

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT handler for updating settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(session.user.id, "admin")

    if (!isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await req.json()

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await db.siteConfig.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
        },
      })
    }

    // Clear cache
    await redis.del("site_settings")

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
