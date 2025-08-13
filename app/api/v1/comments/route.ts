// /home/dit/blogs/DITBlogs/app/api/v1/comments/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth"; // Assumes this can provide a userId
import { redis } from "@/lib/redis";
import * as z from "zod";
import { Prisma } from "@prisma/client";

// Schema for validating incoming comment data for creation
const createCommentSchema = z.object({
  content: z.string().min(1, "Content cannot be empty.").max(2000),
  postSlug: z.string().min(1, "Post slug is required."),
  parentId: z.string().cuid().optional(), // For creating a reply
});

// Define a type for our structured comment with replies
type CommentWithReplies = Prisma.CommentGetPayload<{
  select: {
    id: true;
    content: true;
    createdAt: true;
    user: { select: { id: true; name: true; image: true } };
    parentId: true;
  }
}> & { replies: CommentWithReplies[] };


// GET Comments for a post (with nested replies)
export async function GET(req: NextRequest) {
  // Authentication is still useful here to identify the organization
  const { error, status, org } = await authenticateAndCheckUsage(req);
  if (error || !org) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");

  if (!postSlug) {
    return NextResponse.json({ error: "postSlug is required" }, { status: 400 });
  }

  const cacheKey = `v1:comments:threaded:${org.id}:${postSlug}`;
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
    // 1. Fetch all top-level comments for the post
    const topLevelComments = await db.comment.findMany({
      where: {
        post: { slug: postSlug, organizationId: org.id },
        parentId: null, // Only fetch comments that are not replies
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } }, // Select public user data
        parentId: true
      },
      orderBy: { createdAt: "asc" },
    });

    // 2. Recursively fetch replies for each top-level comment
    const fetchReplies = async (commentId: string, depth = 0): Promise<CommentWithReplies[]> => {
        // Stop recursion at a certain depth to prevent abuse/infinite loops
        if (depth > 5) return [];

        const replies = await db.comment.findMany({
            where: { parentId: commentId },
            select: {
                id: true,
                content: true,
                createdAt: true,
                user: { select: { id: true, name: true, image: true } },
                parentId: true
            },
            orderBy: { createdAt: "asc" }
        });

        const repliesWithNested: CommentWithReplies[] = [];
        for(const reply of replies) {
            const nestedReplies = await fetchReplies(reply.id, depth + 1);
            repliesWithNested.push({ ...reply, replies: nestedReplies });
        }
        return repliesWithNested;
    }

    const commentsWithReplies: CommentWithReplies[] = [];
    for (const comment of topLevelComments) {
        const replies = await fetchReplies(comment.id);
        commentsWithReplies.push({ ...comment, replies });
    }

    // 3. Cache the final hierarchical structure
    try {
      await redis.set(cacheKey, JSON.stringify(commentsWithReplies), { EX: 600 }); // Cache for 10 minutes
    } catch (e) {
      console.error(`Redis SET error for key ${cacheKey}:`, e);
    }

    return NextResponse.json(commentsWithReplies);
  } catch (dbError) {
    console.error("[V1_COMMENTS_GET_ERROR]", dbError);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


// POST a new comment or a reply
export async function POST(req: NextRequest) {
  // Here, auth is CRITICAL to identify who is posting
  // We assume authenticateAndCheckUsage can also return a `userId`
  const { error, status, org, userId } = await authenticateAndCheckUsage(req);
  if (error || !org) return NextResponse.json({ error }, { status });
  if (!userId) return NextResponse.json({ error: "Authentication required to comment." }, { status: 401 });

  try {
    const rawBody = await req.json();
    const validatedBody = createCommentSchema.safeParse(rawBody);

    if (!validatedBody.success) {
      return NextResponse.json({ error: validatedBody.error.flatten().fieldErrors }, { status: 400 });
    }

    const { content, postSlug, parentId } = validatedBody.data;

    // 1. Verify the post exists and belongs to the organization
    const post = await db.post.findFirst({
      where: { slug: postSlug, organizationId: org.id },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // 2. If it's a reply, verify the parent comment exists and is part of the same post
    if (parentId) {
        const parentComment = await db.comment.findFirst({
            where: { id: parentId, postId: post.id }
        });
        if (!parentComment) {
            return NextResponse.json({ error: "Parent comment not found or does not belong to this post." }, { status: 404 });
        }
    }

    // 3. Create the comment in the database
    const newComment = await db.comment.create({
      data: {
        content,
        postId: post.id,
        userId: userId, // Associate with the authenticated user
        parentId: parentId, // Will be null if not a reply
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        parentId: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // 4. CRITICAL: Invalidate the cache for this post's comments
    const cacheKey = `v1:comments:threaded:${org.id}:${postSlug}`;
    try {
      console.log(`CACHE DEL for ${cacheKey}`);
      await redis.del(cacheKey);
    } catch (e) {
      console.error(`Redis DEL error for key ${cacheKey}:`, e);
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
    }
    console.error("[V1_COMMENTS_POST_ERROR]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}