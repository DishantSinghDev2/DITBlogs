import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateForWrite } from "@/lib/api/v1/write-auth";
import { invalidatePostCache, invalidateAllPostsCache } from "@/lib/cache";
import { triggerWebhooks } from "@/lib/webhook-trigger";

// POST /api/v1/posts/[slug]/publish
// Sets publishedAt to now on an existing draft/post scoped to the API key's org.

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

    if (post.publishedAt) {
      return NextResponse.json({ error: "Post is already published." }, { status: 409 });
    }

    const published = await db.post.update({
      where: { id: post.id },
      data: { publishedAt: new Date() },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
      },
    });

    await invalidatePostCache(slug, org.id);
    await invalidateAllPostsCache(org.id);

    await triggerWebhooks(org.id, "post.published", { post: published }).catch(() => {});

    return NextResponse.json(published);
  } catch (err) {
    console.error("[V1_POST_PUBLISH_ERROR]", err);
    return NextResponse.json({ error: "Failed to publish post." }, { status: 500 });
  }
}
