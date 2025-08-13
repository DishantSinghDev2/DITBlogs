// /home/dit/blogs/DITBlogs/app/api/v1/categories/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const { error, status, org } = await authenticateAndCheckUsage(req);
  if (error || !org) return NextResponse.json({ error }, { status });

  const cacheKey = `v1:categories:${org.id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`CACHE HIT for ${cacheKey}`);
      return NextResponse.json(JSON.parse(cached));
    }
  } catch (e) {
    console.error(`Redis GET error for key ${cacheKey}:`, e);
  }

  console.log(`CACHE MISS for ${cacheKey}`);
  try {
    const categories = await db.category.findMany({
      where: { organizationId: org.id },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' }
    });

    try {
      await redis.set(cacheKey, JSON.stringify(categories), { EX: 3600 }); // Cache for 1 hour
    } catch (e) {
      console.error(`Redis SET error for key ${cacheKey}:`, e);
    }

    return NextResponse.json(categories);
  } catch (dbError) {
    console.error("[V1_CATEGORIES_GET_ERROR]", dbError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}