import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"

const commentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Comment cannot be empty"),
  parentId: z.string().optional(),
})

// GET handler for fetching comments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Get comments for the post
    const comments = await db.comment.findMany({
      where: {
        postId,
        parentId: null, // Get only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST handler for creating a comment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { postId, content, parentId } = commentSchema.parse(body)

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // If it's a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 })
      }
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        content,
        post: {
          connect: { id: postId },
        },
        user: {
          connect: { id: session.user.id },
        },
        ...(parentId && {
          parent: {
            connect: { id: parentId },
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Clear cache
    await redis.del(`post_comments:${postId}`)

    // Create notification for post author if it's not their own comment
    if (post.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          type: "comment",
          title: "New Comment",
          message: `${session.user.name} commented on your post: "${post.title}"`,
          user: {
            connect: { id: post.authorId },
          },
          relatedId: comment.id,
        },
      })
    }

    // If it's a reply, notify the parent comment author
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
        include: { user: true },
      })

      if (parentComment && parentComment.userId !== session.user.id) {
        await db.notification.create({
          data: {
            type: "reply",
            title: "New Reply",
            message: `${session.user.name} replied to your comment on "${post.title}"`,
            user: {
              connect: { id: parentComment.userId },
            },
            relatedId: comment.id,
          },
        })
      }
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

// DELETE handler for removing a comment
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
    }

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: { id },
      include: { post: true },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user is the comment author or post author or admin
    const isCommentAuthor = comment.userId === session.user.id
    const isPostAuthor = comment.post.authorId === session.user.id
    const isAdmin = session.user.role === "admin"

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Delete comment
    await db.comment.delete({
      where: { id },
    })

    // Clear cache
    await redis.del(`post_comments:${comment.postId}`)

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
