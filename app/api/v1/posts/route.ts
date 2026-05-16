// /home/dit/blogs/DITBlogs/app/api/v1/posts/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";
import { authenticateForWrite } from "@/lib/api/v1/write-auth";
import { invalidateAllPostsCache, invalidatePostCache } from "@/lib/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import slugify from "slugify";

// ─── Zod schema for POST /api/v1/posts ────────────────────────────────────────

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.unknown().refine((v) => v !== undefined && v !== null, {
    message: "Content is required",
  }),
  slug: z.string().min(3).optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().url("featuredImage must be a valid URL").optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categorySlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publish: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  // 1. Authenticate and authorize the request
  const { error, status, org, warning } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status });
  }

  // 2. Parse and validate query parameters
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category") || "";
  const tagSlug = searchParams.get("tag") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  // 3. Create a dynamic cache key
  const cacheKey = `v2:posts:${org.id}:cat=${categorySlug}:tag=${tagSlug}:p=${page}:l=${limit}`;
  
  try {
    // 4. Check cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`CACHE HIT for ${cacheKey}`);
      const response = NextResponse.json(JSON.parse(cachedData));
      if (warning) response.headers.set("X-Usage-Warning", warning);
      return response;
    }
  } catch (e) {
    console.error(`Redis GET error for key ${cacheKey}:`, e);
  }

  // 5. If cache miss, build query and fetch from DB
  console.log(`CACHE MISS for ${cacheKey}`);
  try {
    const where: Prisma.PostWhereInput = {
      organizationId: org.id
    };
    if (categorySlug) where.category = { slug: categorySlug };
    if (tagSlug) where.tags = { some: { slug: tagSlug } };

    const [posts, total] = await db.$transaction([
        db.post.findMany({
            where,
            select: {
              title: true,
              slug: true,
              excerpt: true,
              publishedAt: true,
              author: { select: { name: true } },
            },
            orderBy: { publishedAt: "desc" },
            take: limit,
            skip: skip,
        }),
        db.post.count({ where }),
    ]);

    const responseData = {
        posts,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        }
    };

    // 6. Store result in Redis
    try {
        // Cache for 10 minutes, as lists change more often.
        await redis.set(cacheKey, JSON.stringify(responseData), { EX: 600 });
    } catch(e) {
        console.error(`Redis SET error for key ${cacheKey}:`, e);
    }

    const response = NextResponse.json(responseData);
    if (warning) {
      response.headers.set("X-Usage-Warning", warning);
    }
    return response;

  } catch (dbError) {
    console.error("[V1_POSTS_GET_ERROR]", dbError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ─── POST /api/v1/posts ────────────────────────────────────────────────────────
// Create a new post. Requires Bearer API key. The post is scoped to the org
// that owns the key. By default the post is saved as a draft (publishedAt=null);
// pass `"publish": true` to publish immediately.

export async function POST(req: NextRequest) {
  const { error, status, org } = await authenticateForWrite(req);
  if (error || !org) return NextResponse.json({ error }, { status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { title, content, excerpt, featuredImage, metaTitle, metaDescription, categorySlug, tags, publish, featured } = parsed.data;

  try {
    // Resolve / generate slug
    let slug = parsed.data.slug ?? slugify(title, { lower: true, strict: true });
    const conflict = await db.post.findUnique({ where: { slug } });
    if (conflict) slug = `${slug}-${Date.now()}`;

    // Resolve category (org-scoped, created if missing)
    let categoryId: string | undefined;
    if (categorySlug) {
      const cat = await db.category.upsert({
        where: { organizationId_slug: { organizationId: org.id, slug: categorySlug } },
        create: {
          name: categorySlug,
          slug: categorySlug,
          organizationId: org.id,
        },
        update: {},
        select: { id: true },
      });
      categoryId = cat.id;
    }

    // Resolve tags (org-scoped, created if missing)
    let tagIds: { id: string }[] = [];
    if (tags && tags.length > 0) {
      tagIds = await Promise.all(
        tags.map(async (t) => {
          const tagSlug = slugify(t, { lower: true, strict: true });
          const tag = await db.tag.upsert({
            where: { organizationId_slug: { organizationId: org.id, slug: tagSlug } },
            create: { name: t, slug: tagSlug, organizationId: org.id },
            update: {},
            select: { id: true },
          });
          return tag;
        })
      );
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        content: content as Prisma.InputJsonValue,
        excerpt,
        featuredImage,
        metaTitle,
        metaDescription,
        featured: featured ?? false,
        publishedAt: publish ? new Date() : null,
        organizationId: org.id,
        authorId: org.ownerId,
        ...(categoryId && { categoryId }),
        ...(tagIds.length > 0 && { tags: { connect: tagIds } }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        featured: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true, slug: true } },
      },
    });

    await invalidateAllPostsCache(org.id);
    if (publish) await invalidatePostCache(post.slug, org.id);

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[V1_POSTS_POST_ERROR]", err);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}