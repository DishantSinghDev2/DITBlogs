import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";

// GET handler to fetch a single tag and its associated posts
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { error, status, org } = await authenticateAndCheckUsage(req);
  if (error || !org) return NextResponse.json({ error }, { status });
  
  const { slug } = params;
  const { searchParams } = new URL(req.url);
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const cacheKey = `v1:tag:${org.id}:${slug}:p=${page}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return NextResponse.json(JSON.parse(cachedData as string));
  } catch (e) { console.error("Redis GET error:", e); }

  try {
    // A tag query is slightly different due to the many-to-many relationship
    const [tag, posts, total] = await db.$transaction([
      db.tag.findFirst({
        where: { slug, organizationId: org.id },
        select: { name: true, slug: true },
      }),
      db.post.findMany({
        where: {
          organizationId: org.id,
          tags: { some: { slug } }, // Use 'some' for many-to-many
        },
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
        where: {
          organizationId: org.id,
          tags: { some: { slug } },
        },
      }),
    ]);
    
    if (!tag) {
        return NextResponse.json({ error: "Tag not found." }, { status: 404 });
    }
    
    const responseData = { tag, posts, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
    await redis.set(cacheKey, JSON.stringify(responseData), { EX: 600 });
    return NextResponse.json(responseData);
  } catch (dbError) {
      console.error("[V1_TAG_SLUG_GET]", dbError);
      return new NextResponse("Internal Database Error", { status: 500 });
  }
}