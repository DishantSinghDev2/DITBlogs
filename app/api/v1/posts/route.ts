import { db } from "@/lib/db";
import { redis } from "@/lib/redis"; // <-- Import Redis client
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";

export async function GET(req: NextRequest) {
  const { error, status, org, warning } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const page = searchParams.get('page') || '1';
  
  // --- 1. Create a dynamic cache key based on query params ---
  const cacheKey = `v1:posts:${org.id}:cat=${category}:tag=${tag}:p=${page}`;

  try {
    // --- 2. Try to fetch from Redis first ---
    const cachedPosts = await redis.get(cacheKey);
    if (cachedPosts) {
      const response = NextResponse.json(JSON.parse(cachedPosts as string));
      if (warning) response.headers.set('X-Usage-Warning', warning);
      console.log(`CACHE HIT for ${cacheKey}`);
      return response;
    }
  } catch (e) {
    console.error("Redis GET error:", e);
  }

  // --- 3. If cache miss, build the query and fetch from DB ---
  console.log(`CACHE MISS for ${cacheKey}`);
  const query: any = {
    organizationId: org.id,
    published: true,
  };
  if (category) query.category = { slug: category };
  if (tag) query.tags = { some: { slug: tag } };

  const posts = await db.post.findMany({
    where: query,
    select: { /* select only public-safe fields */ title: true, slug: true, content: true, publishedAt: true },
    // Add pagination logic if needed
    take: 10,
    skip: (Number(page) - 1) * 10,
  });

  try {
    // --- 4. Store the result in Redis ---
    // Cache for a shorter duration, e.g., 10 minutes, as lists change more often
    await redis.set(cacheKey, JSON.stringify(posts), { EX: 600 });
  } catch(e) {
    console.error("Redis SET error:", e);
  }

  const response = NextResponse.json(posts);
  if (warning) {
    response.headers.set('X-Usage-Warning', warning);
  }
  return response;
}