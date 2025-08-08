import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";
import { redis } from "@/lib/redis";
import * as z from "zod";

const commentSchema = z.object({
    content: z.string().min(1),
    authorName: z.string().min(1), // Public users provide their name
    authorEmail: z.string().email(),
});

// GET Comments for a post
export async function GET(req: NextRequest) {
    // This endpoint should be public but rate-limited, so we use a lighter auth check
    // For simplicity, we assume the API key is passed for all V1 routes
    const { error, status, org } = await authenticateAndCheckUsage(req);
    if (error || !org) return NextResponse.json({ error }, { status });

    const { searchParams } = new URL(req.url);
    const postSlug = searchParams.get('postSlug');
    if (!postSlug) return NextResponse.json({ error: "postSlug is required" }, { status: 400 });

    const cacheKey = `v1:comments:${postSlug}`;
    try {
        const cached = await redis.get(cacheKey);
        if (cached) return NextResponse.json(JSON.parse(cached));
    } catch(e) { console.error(e); }

    const comments = await db.comment.findMany({
        where: { post: { slug: postSlug, organizationId: org.id } },
        // select only public-safe fields
    });
    
    try {
       await redis.set(cacheKey, JSON.stringify(comments), { EX: 600 }); // Cache for 10 minutes
    } catch(e) { console.error(e); }
    
    return NextResponse.json(comments);
}

// POST a new comment
export async function POST(req: NextRequest) {
    const { error, status, org } = await authenticateAndCheckUsage(req);
    if (error || !org) return NextResponse.json({ error }, { status });
    
    // ... logic to create the comment ...
    // ... remember to invalidate the cache: await redis.del(`v1:comments:${postSlug}`); ...
}