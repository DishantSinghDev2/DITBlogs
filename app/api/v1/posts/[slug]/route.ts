import { db } from "@/lib/db";
import { redis } from "@/lib/redis"; // <-- Import Redis client
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { error, status, org, warning } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status });
  }

  // --- 1. Define a unique cache key ---
  const cacheKey = `v1:post:${org.id}:${params.slug}`;

  try {
    // --- 2. Try to fetch from Redis first ---
    const cachedPost = await redis.get(cacheKey);
    if (cachedPost) {
      // --- Increment usage counter even on cache hit ---
      await db.organization.update({
        where: { id: org.id },
        data: { monthlyPostViews: { increment: 1 } },
      });
      
      const response = NextResponse.json(JSON.parse(cachedPost as string));
      if (warning) response.headers.set('X-Usage-Warning', warning);
      console.log(`CACHE HIT for ${cacheKey}`);
      return response;
    }
  } catch (e) {
    console.error("Redis GET error:", e);
  }

  // --- 3. If cache miss, fetch from DB ---
  console.log(`CACHE MISS for ${cacheKey}`);
  const post = await db.post.findFirst({
    where: { organizationId: org.id, slug: params.slug },
    select: { /* public-safe fields */ title: true, slug: true, content: true, publishedAt: true }
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  // --- Increment usage counter on DB fetch ---
  await db.organization.update({
    where: { id: org.id },
    data: { monthlyPostViews: { increment: 1 } },
  });

  try {
    // --- 4. Store the result in Redis for next time ---
    // Cache for 1 hour. A good balance for content that might be updated.
    await redis.set(cacheKey, JSON.stringify(post), { EX: 3600 }); 
  } catch(e) {
    console.error("Redis SET error:", e);
  }

  const response = NextResponse.json(post);
  if (warning) {
    response.headers.set('X-Usage-Warning', warning);
  }
  return response;
}