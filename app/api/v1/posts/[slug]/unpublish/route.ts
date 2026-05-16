import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateForWrite } from "@/lib/api/v1/write-auth";
import { invalidatePostCache, invalidateAllPostsCache } from "@/lib/cache";

// POST /api/v1/posts/[slug]/unpublish
// Sets publishedAt to null, making the post a draft again.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { error, status, org } = await authenticateForWrite(req);
  if (error || !org) return NextResponse.json({ error }, { status });

  const { slug } = await params;

  try {
    const post = await db.post.findFirst({
      where: { slug, organizationId: org.id },
      select: { id: true, publishedAt: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (!post.publishedAt) {
      return NextResponse.json({ error: "Post is already a draft." }, { status: 409 });
    }

    const unpublished = await db.post.update({
      where: { id: post.id },
      data: { publishedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
      },
    });

    await invalidatePostCache(slug, org.id);
    await invalidateAllPostsCache(org.id);

    return NextResponse.json(unpublished);
  } catch (err) {
    console.error("[V1_POST_UNPUBLISH_ERROR]", err);
    return NextResponse.json({ error: "Failed to unpublish post." }, { status: 500 });
  }
}
