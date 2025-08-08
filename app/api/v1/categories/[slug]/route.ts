import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";

// GET handler to fetch a single category and its associated posts
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // 1. Authenticate the request via API key
  const { error, status, org } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status });
  }

  const { slug } = params;
  const { searchParams } = new URL(req.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  // 2. Create a unique cache key for this specific category page
  const cacheKey = `v1:category:${org.id}:${slug}:p=${page}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`CACHE HIT for ${cacheKey}`);
      return NextResponse.json(JSON.parse(cachedData as string));
    }
  } catch (e) {
    console.error("Redis GET error:", e);
  }
  
  console.log(`CACHE MISS for ${cacheKey}`);

  // 3. If cache miss, fetch from the database in a transaction
  try {
    const [category, posts, total] = await db.$transaction([
      // Find the category by its slug within the organization
      db.category.findFirst({
        where: { slug, organizationId: org.id },
        select: { name: true, slug: true, description: true },
      }),
      // Find all published posts in that category, with pagination
      db.post.findMany({
        where: {
          organizationId: org.id,
          category: { slug },
        },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          // You can include other public-safe fields like author name if needed
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      // Get the total count for pagination
      db.post.count({
        where: {
          organizationId: org.id,
          category: { slug },
        },
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
        }
    };

    // 4. Store the result in Redis for next time
    try {
        // Cache for 10 minutes, as post lists can change
        await redis.set(cacheKey, JSON.stringify(responseData), { EX: 600 });
    } catch(e) {
        console.error("Redis SET error:", e);
    }

    return NextResponse.json(responseData);

  } catch (dbError) {
      console.error("[V1_CATEGORY_SLUG_GET]", dbError);
      return new NextResponse("Internal Database Error", { status: 500 });
  }
}