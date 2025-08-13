// /home/dit/blogs/DITBlogs/app/api/v1/posts/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";
import { Prisma } from "@prisma/client";

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
  const cacheKey = `v1:posts:${org.id}:cat=${categorySlug}:tag=${tagSlug}:p=${page}:l=${limit}`;
  
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