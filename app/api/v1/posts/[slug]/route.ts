// app/api/v1/posts/[slug]/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis"; // Assuming you have a redis client setup
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth"; // Assuming you have this helper

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