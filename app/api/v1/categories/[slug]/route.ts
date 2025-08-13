// /home/dit/blogs/DITBlogs/app/api/v1/categories/[slug]/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { error, status, org } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status });
  }

  const { slug } = params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(1, Number.parseInt(searchParams.get("limit") || "10"));
  const skip = (page - 1) * limit;

  const cacheKey = `v1:category:${org.id}:${slug}:p=${page}:l=${limit}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`CACHE HIT for ${cacheKey}`);
      return NextResponse.json(JSON.parse(cachedData as string));
    }
  } catch (e) {
    console.error(`Redis GET error for key ${cacheKey}:`, e);
  }

  console.log(`CACHE MISS for ${cacheKey}`);
  try {
    // Fetch category and posts in a single transaction
    const [category, posts, total] = await db.$transaction([
      db.category.findFirst({
        where: { slug, organizationId: org.id },
        select: { name: true, slug: true, description: true },
      }),
      db.post.findMany({
        where: { organizationId: org.id, category: { slug } },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({
        where: { organizationId: org.id, category: { slug } },
      }),
    ]);

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const responseData = {
      category,
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    try {
      // Cache for 10 minutes, as post lists can change
      await redis.set(cacheKey, JSON.stringify(responseData), { EX: 600 });
    } catch (e) {
      console.error(`Redis SET error for key ${cacheKey}:`, e);
    }

    return NextResponse.json(responseData);
  } catch (dbError) {
    console.error("[V1_CATEGORY_SLUG_GET_ERROR]", dbError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}