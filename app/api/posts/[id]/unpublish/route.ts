// /app/api/posts/[id]/unpublish/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";
import { triggerWebhooks } from "@/lib/webhook-trigger";
import { Prisma } from "@prisma/client";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = params;
  const canEdit = await canUserPerformAction(session.user.id, "post:edit", id);
  if (!canEdit) return new NextResponse("Forbidden", { status: 403 });

  try {
    const { originalPost, newDraft } = await db.$transaction(async (tx) => {
      // 1) Load the post with relations you need to replicate
      const post = await tx.post.findUnique({
        where: { id },
        include: { tags: true },
      });
      if (!post) throw new Error("Post not found");

      // 2) Create a Draft — map only fields that exist on Draft
      //    IMPORTANT: Do NOT spread `post`; do NOT pass unknown fields.
      const draft = await tx.draft.create({
        data: {
          title: post.title,
          slug: post.slug, // Draft.slug is not unique; OK to reuse
          content: post.content as Prisma.InputJsonValue, // JSON-safe
          excerpt: post.excerpt ?? null,
          featuredImage: post.featuredImage ?? null,
          metaTitle: post.metaTitle ?? null,
          metaDescription: post.metaDescription ?? null,

          organizationId: post.organizationId,
          authorId: post.authorId,
          categoryId: post.categoryId,

          // Do NOT set `postId` if you keep onDelete: Cascade on the relation
          // postId: post.id,

          // Copy tags if any
          ...(post.tags.length
            ? { tags: { connect: post.tags.map((t) => ({ id: t.id })) } }
            : {}),
        },
      });

      // 3) Delete the Post (this won’t nuke the draft because we didn’t set postId)
      await tx.post.delete({ where: { id } });

      return { originalPost: post, newDraft: draft };
    });

    // 4) Invalidate caches (non-blocking, guard against Redis hiccups)
    try {
      await redis.del(`v1:post:${originalPost.organizationId}:${originalPost.slug}`);
      const keys = await redis.keys(`v1:posts:${originalPost.organizationId}:*`);
      if (keys.length) await redis.del(keys);
      await redis.del(`post:${originalPost.slug}`); // legacy
    } catch (e) {
      console.warn("Redis cache invalidation failed:", e);
    }

    // 5) Webhooks
    await triggerWebhooks(originalPost.organizationId, "post.unpublished", { post: originalPost });

    return NextResponse.json(newDraft);
  } catch (err) {
    console.error("Unpublish transaction failed:", err);
    return new NextResponse("Failed to unpublish", { status: 500 });
  }
}
