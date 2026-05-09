import { db } from "@/lib/db";
import { invalidatePostCache } from "@/lib/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { triggerWebhooks } from "@/lib/webhook-trigger";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = params;
  const draft = await db.draft.findUnique({
    where: { id },
    include: { tags: { select: { id: true } } },
  });

  if (!draft || draft.authorId !== session.user.id) {
    return new NextResponse("Draft not found or permission denied", { status: 404 });
  }

  const postData = {
    title: draft.title,
    slug: draft.slug,
    content: draft.content,
    excerpt: draft.excerpt,
    featuredImage: draft.featuredImage,
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    organizationId: draft.organizationId,
    authorId: draft.authorId,
    categoryId: draft.categoryId,
    publishedAt: new Date(),
  };

  const tagConnect = { connect: draft.tags.map((t) => ({ id: t.id })) };
  const tagSet = { set: draft.tags.map((t) => ({ id: t.id })) };

  let publishedPost;

  if (draft.postId) {
    const existingPost = await db.post.findUnique({
      where: { id: draft.postId },
      select: { slug: true },
    });

    publishedPost = await db.post.update({
      where: { id: draft.postId },
      data: { ...postData, tags: tagSet },
    });

    // Invalidate old slug if it changed
    if (existingPost && existingPost.slug !== publishedPost.slug) {
      await invalidatePostCache(existingPost.slug, publishedPost.organizationId);
    }

    await db.draft.delete({ where: { id } });
  } else {
    publishedPost = await db.post.create({
      data: { ...postData, tags: tagConnect },
    });
    await db.draft.delete({ where: { id } });
  }

  await invalidatePostCache(publishedPost.slug, publishedPost.organizationId);
  await triggerWebhooks(publishedPost.organizationId, "post.published", { post: publishedPost });

  return NextResponse.json(publishedPost);
}
