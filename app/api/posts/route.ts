import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import slugify from "slugify"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { checkUserPermission } from "@/lib/api/user"

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
})

// GET handler for fetching posts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const published = searchParams.get("published")
    const featured = searchParams.get("featured")
    const categoryId = searchParams.get("categoryId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build the query
    const query: any = {}

    if (userId) {
      query.authorId = userId
    }

    if (published !== null) {
      query.published = published === "true"
    }

    if (featured !== null) {
      query.featured = featured === "true"
    }

    if (categoryId) {
      query.categoryId = categoryId
    }

    // Get posts
    const posts = await db.post.findMany({
      where: query,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            comments: true,
            views: true,
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
    const total = await db.post.count({
      where: query,
    })

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// POST handler for creating a new post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create posts
    const canCreatePost = await checkUserPermission(session.user.id, "create:post")

    if (!canCreatePost) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = postSchema.parse(body)

    // Generate a unique slug if needed
    let slug = validatedData.slug
    const existingPost = await db.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    // Create the post
    const post = await db.post.create({
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        featuredImage: validatedData.featuredImage,
        metaTitle: validatedData.metaTitle || validatedData.title,
        metaDescription: validatedData.metaDescription || validatedData.excerpt,
        published: validatedData.published || false,
        featured: validatedData.featured || false,
        author: {
          connect: { id: session.user.id },
        },
        ...(validatedData.categoryId && {
          category: {
            connect: { id: validatedData.categoryId },
          },
        }),
        ...(validatedData.tags &&
          validatedData.tags.length > 0 && {
            tags: {
              connectOrCreate: validatedData.tags.map((tag) => ({
                where: { name: tag },
                create: {
                  name: tag,
                  slug: slugify(tag, { lower: true }),
                },
              })),
            },
          }),
      },
    })

    // Clear cache
    await redis.del("featured_posts")

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Validation error:", error.errors)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

// PUT handler for updating a post
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = body

    if (!validatedData.id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Check if post exists and user has permission
    const existingPost = await db.post.findUnique({
      where: { id: validatedData.id },
      include: { author: true },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is the author or has edit permission
    const isAuthor = existingPost.authorId === session.user.id
    const canEditPost = await checkUserPermission(session.user.id, "edit:post")

    if (!isAuthor && !canEditPost) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Check if slug is being changed and ensure it's unique
    let slug = validatedData.slug
    if (slug !== existingPost.slug) {
      const slugExists = await db.post.findFirst({
        where: {
          slug,
          id: { not: validatedData.id },
        },
      })

      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // Update the post
    const post = await db.post.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        featuredImage: validatedData.featuredImage,
        metaTitle: validatedData.metaTitle || validatedData.title,
        metaDescription: validatedData.metaDescription || validatedData.excerpt,
        published: validatedData.published ?? existingPost.published,
        featured: validatedData.featured ?? existingPost.featured,
        ...(validatedData.published && !existingPost.published && { publishedAt: new Date() }),
        ...(validatedData.categoryId && {
          category: {
            connect: { id: validatedData.categoryId },
          },
        }),
        ...(validatedData.categoryId === null && {
          category: {
            disconnect: true,
          },
        }),
      },
    })

    // Handle tags if provided
    if (validatedData.tags) {
      // First disconnect all existing tags
      await db.post.update({
        where: { id: validatedData.id },
        data: {
          tags: {
            set: [],
          },
        },
      })

      // Then connect or create new tags
      if (validatedData.tags.length > 0) {
        await db.post.update({
          where: { id: validatedData.id },
          data: {
            tags: {
              connectOrCreate: validatedData.tags.map((tag: string) => ({
                where: { name: tag },
                create: {
                  name: tag,
                  slug: slugify(tag, { lower: true }),
                },
              })),
            },
          },
        })
      }
    }

    // Clear cache
    await redis.del(`post:${post.slug}`)
    await redis.del("featured_posts")

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

// DELETE handler for deleting a post
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Check if post exists and user has permission
    const existingPost = await db.post.findUnique({
      where: { id },
      include: { author: true },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is the author or has delete permission
    const isAuthor = existingPost.authorId === session.user.id
    const canDeletePost = await checkUserPermission(session.user.id, "delete:post")

    if (!isAuthor && !canDeletePost) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Delete the post
    await db.post.delete({
      where: { id },
    })

    // Clear cache
    await redis.del(`post:${existingPost.slug}`)
    await redis.del("featured_posts")

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
