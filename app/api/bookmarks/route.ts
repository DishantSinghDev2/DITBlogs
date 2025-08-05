import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

const bookmarkSchema = z.object({
  postId: z.string(),
})

// GET handler for fetching user's bookmarks
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get bookmarks
    const bookmarks = await db.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count
    const total = await db.bookmark.count({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      bookmarks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
  }
}

// POST handler for adding a bookmark
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { postId } = bookmarkSchema.parse(body)

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if already bookmarked
    const existingBookmark = await db.bookmark.findFirst({
      where: {
        postId,
        userId: session.user.id,
      },
    })

    if (existingBookmark) {
      return NextResponse.json({ message: "Post already bookmarked" }, { status: 409 })
    }

    // Create bookmark
    const bookmark = await db.bookmark.create({
      data: {
        post: {
          connect: { id: postId },
        },
        user: {
          connect: { id: session.user.id },
        },
      },
    })

    return NextResponse.json(bookmark, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error creating bookmark:", error)
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 })
  }
}

// DELETE handler for removing a bookmark
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Delete bookmark
    await db.bookmark.deleteMany({
      where: {
        postId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Bookmark removed successfully" })
  } catch (error) {
    console.error("Error removing bookmark:", error)
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 })
  }
}
