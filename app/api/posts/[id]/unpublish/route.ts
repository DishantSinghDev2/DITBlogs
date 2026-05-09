import { db } from "@/lib/db";
import { invalidatePostCache } from "@/lib/cache";
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
      const post = await tx.post.findUnique({
        where: { id },
        include: { tags: true },
      });
      if (!post) throw new Error("Post not found");

      const draft = await tx.draft.create({
        data: {
          title: post.title,
          slug: post.slug,
          content: post.content as Prisma.InputJsonValue,
          excerpt: post.excerpt ?? null,
          featuredImage: post.featuredImage ?? null,
          metaTitle: post.metaTitle ?? null,
          metaDescription: post.metaDescription ?? null,
          organizationId: post.organizationId,
          authorId: post.authorId,
          categoryId: post.categoryId,
          ...(post.tags.length
            ? { tags: { connect: post.tags.map((t) => ({ id: t.id })) } }
            : {}),
        },
      });

      await tx.post.delete({ where: { id } });

      return { originalPost: post, newDraft: draft };
    });

    await invalidatePostCache(originalPost.slug, originalPost.organizationId);
    await triggerWebhooks(originalPost.organizationId, "post.unpublished", { post: originalPost });

    return NextResponse.json(newDraft);
  } catch (err) {
    console.error("Unpublish transaction failed:", err);
    return new NextResponse("Failed to unpublish", { status: 500 });
  }
}
