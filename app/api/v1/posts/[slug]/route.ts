// app/api/v1/posts/[slug]/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";
import { authenticateForWrite } from "@/lib/api/v1/write-auth";
import { invalidatePostCache, invalidateAllPostsCache } from "@/lib/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import slugify from "slugify";

const updatePostSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.unknown().optional(),
  slug: z.string().min(3).optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().url("featuredImage must be a valid URL").optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  categorySlug: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // 1. Authenticate and authorize the request
  const { error, status, org, warning } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status: status || 401 });
  }

  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: "Post slug is required." }, { status: 400 });
  }

  // 2. Define a unique cache key
  const cacheKey = `v2:post:${org.id}:${slug}`;
  let cachedPost: string | null = null;

  try {
    // 3. Try to fetch from Redis first
    cachedPost = await redis.get(cacheKey);
    if (cachedPost) {
      console.log(`CACHE HIT for ${cacheKey}`);
      const response = NextResponse.json(JSON.parse(cachedPost));
      // Add usage warning header if it exists
      if (warning) response.headers.set("X-Usage-Warning", warning);
      return response;
    }
  } catch (e) {
    console.error(`Redis GET error for key ${cacheKey}:`, e);
    // If Redis fails, we proceed to fetch from DB but log the error.
  }

  // 4. If cache miss, fetch from DB
  console.log(`CACHE MISS for ${cacheKey}`);
  try {
    const post = await db.post.findFirst({
      where: {
        organizationId: org.id,
        slug: slug,
        // Ensure we only fetch published posts for the public API usually, 
        // though your requirement didn't specify checking 'publishedAt', 
        // usually 'publishedAt: { not: null }' is good practice here.
        // For now, adhering to your previous logic of just slug + orgId.
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        publishedAt: true,
        featuredImage: true,
        author: {
          select: { name: true, image: true, bio: true }
        },
        category: {
          select: { name: true, slug: true }
        },
        // --- ADDED: Fetch Tags ---
        tags: {
          select: {
            name: true,
            slug: true
          }
        }
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // 5. Store the result in Redis for next time
    try {
      // Cache for 1 hour. Good balance for content that might be updated.
      // Note: If you update a post's tags, the cache will need to expire or be invalidated manually
      await redis.set(cacheKey, JSON.stringify(post), { EX: 3600 });
    } catch (e) {
      console.error(`Redis SET error for key ${cacheKey}:`, e);
    }

    // 6. Record View
    // Run these in parallel to not block the response too much, 
    // or await them if strict consistency is needed.
    await Promise.all([
      db.postView.create({
        data: {
          post: {
            connect: { id: post.id },
          },
          // Optional: You could capture IP or User Agent here if needed
        },
      }),
      db.organization.update({
        where: { id: org.id },
        data: { monthlyPostViews: { increment: 1 } },
      })
    ]);

    const response = NextResponse.json(post);
    if (warning) {
      response.headers.set("X-Usage-Warning", warning);
    }
    return response;

  } catch (dbError) {
    console.error("[V1_POST_SLUG_GET_ERROR]", dbError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ─── PUT /api/v1/posts/[slug] ──────────────────────────────────────────────────
// Partial update — only send the fields you want to change.
// Tags are replaced wholesale when provided; omit `tags` to leave them untouched.

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, status, org } = await authenticateForWrite(req);
  if (error || !org) return NextResponse.json({ error }, { status });

  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    // Security: only update posts that belong to this org
    const existing = await db.post.findFirst({
      where: { slug, organizationId: org.id },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const { title, content, excerpt, featuredImage, metaTitle, metaDescription, categorySlug, tags, featured } = parsed.data;

    // Resolve new slug if title changed and no explicit slug provided
    let newSlug = parsed.data.slug;
    if (!newSlug && title) {
      newSlug = slugify(title, { lower: true, strict: true });
      const conflict = await db.post.findFirst({ where: { slug: newSlug, id: { not: existing.id } } });
      if (conflict) newSlug = `${newSlug}-${Date.now()}`;
    }

    // Resolve category
    let categoryId: string | null | undefined = undefined;
    if (categorySlug === null) {
      categoryId = null;
    } else if (categorySlug) {
      const cat = await db.category.upsert({
        where: { organizationId_slug: { organizationId: org.id, slug: categorySlug } },
        create: { name: categorySlug, slug: categorySlug, organizationId: org.id },
        update: {},
        select: { id: true },
      });
      categoryId = cat.id;
    }

    // Resolve tags
    let tagOp: Prisma.PostUpdateInput["tags"] | undefined;
    if (tags !== undefined) {
      const tagIds = await Promise.all(
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
      tagOp = { set: tagIds };
    }

    const updateData: Prisma.PostUpdateInput = {
      ...(title && { title }),
      ...(content !== undefined && { content: content as Prisma.InputJsonValue }),
      ...(newSlug && { slug: newSlug }),
      ...(excerpt !== undefined && { excerpt }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(featured !== undefined && { featured }),
      ...(categoryId !== undefined && { categoryId }),
      ...(tagOp && { tags: tagOp }),
    };

    const updated = await db.post.update({
      where: { id: existing.id },
      data: updateData,
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

    // Invalidate old slug + new slug in case it changed
    await invalidatePostCache(existing.slug, org.id);
    if (newSlug && newSlug !== existing.slug) await invalidatePostCache(newSlug, org.id);
    await invalidateAllPostsCache(org.id);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[V1_POST_SLUG_PUT_ERROR]", err);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

// ─── DELETE /api/v1/posts/[slug] ──────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, status, org } = await authenticateForWrite(req);
  if (error || !org) return NextResponse.json({ error }, { status });

  const { slug } = await params;

  try {
    const existing = await db.post.findFirst({
      where: { slug, organizationId: org.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    await db.post.delete({ where: { id: existing.id } });
    await invalidatePostCache(slug, org.id);
    await invalidateAllPostsCache(org.id);

    return NextResponse.json({ message: "Post deleted." });
  } catch (err) {
    console.error("[V1_POST_SLUG_DELETE_ERROR]", err);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}