import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

// GET handler for fetching user's notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    const unreadOnly = searchParams.get("unread") === "true"

    // Build query
    const query: any = {
      userId: session.user.id,
    }

    if (unreadOnly) {
      query.read = false
    }

    // Get notifications
    const notifications = await db.notification.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count
    const total = await db.notification.count({
      where: query,
    })

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    })

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// PUT handler for marking notifications as read
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, all } = body

    if (all) {
      // Mark all notifications as read
      await db.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      })

      return NextResponse.json({ message: "All notifications marked as read" })
    } else if (id) {
      // Mark specific notification as read
      const notification = await db.notification.findUnique({
        where: { id },
      })

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 })
      }

      if (notification.userId !== session.user.id) {
        return NextResponse.json({ error: "Permission denied" }, { status: 403 })
      }

      await db.notification.update({
        where: { id },
        data: { read: true },
      })

      return NextResponse.json({ message: "Notification marked as read" })
    } else {
      return NextResponse.json({ error: "Either id or all parameter is required" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
