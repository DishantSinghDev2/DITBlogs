// /home/dit/blogs/DITBlogs/app/api/v1/posts/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const { error, status, org } = await authenticateAndCheckUsage(req);
  if (error || !org) return NextResponse.json({ error }, { status });

  const cacheKey = `v1:tags:${org.id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return NextResponse.json(JSON.parse(cached));
  } catch (e) { console.error(e); }

  const tags = await db.tag.findMany({ 
    where: { organizationId: org.id }, 
    select: { name: true, slug: true } 
  });

  try {
    await redis.set(cacheKey, JSON.stringify(tags), { EX: 3600 }); // Cache for 1 hour
  } catch (e) { console.error(e); }

  return NextResponse.json(tags);
}