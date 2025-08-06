import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import slugify from "slugify";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
// FIX: Use the correct, context-aware permission checker
import { canUserPerformAction } from "@/lib/api/user";


// At the top of your file
const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  // FIX: Add organizationId and make it required
  organizationId: z.string().min(1, "Organization ID is required"),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});
// GET handler for fetching posts FOR THE CURRENT USER'S ORGANIZATION
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX: Get the user's organization to scope the query
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      // If user has no org, they have no posts to see.
      return NextResponse.json({ posts: [], pagination: { total: 0 } });
    }

    const { searchParams } = new URL(req.url);
    const published = searchParams.get("published");
    const featured = searchParams.get("featured");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // FIX: The query is now ALWAYS scoped to the user's organization
    const query: any = {
      organizationId: user.organizationId,
    };

    if (published !== null) {
      query.published = published === "true";
    }
    if (featured !== null) {
      query.featured = featured === "true";
    }

    const [posts, total] = await db.$transaction([
      db.post.findMany({
        where: query,
        include: { /* ... your includes ... */ },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where: query }),
    ]);

    return NextResponse.json({
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST handler for creating a new post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = postSchema.parse(body);

    // FIX: The organizationId comes from the validated data
    const { organizationId } = validatedData;

    // FIX: Use the correct, context-aware permission check
    const canCreate = await canUserPerformAction(
      session.user.id,
      "post:create",
      organizationId
    );

    if (!canCreate) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Generate a unique slug (your logic is fine)
    let slug = validatedData.slug;
    const existingPost = await db.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await db.post.create({
      data: {
        ...validatedData,
        slug,
        authorId: session.user.id, // Set author from session
        // FIX: organizationId is now part of validatedData
        organizationId: validatedData.organizationId,
        // ... (your logic for category and tags is fine)
      },
    });

    await redis.del("featured_posts");
    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
