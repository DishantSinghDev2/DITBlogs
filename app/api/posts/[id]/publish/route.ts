// /home/dit/blogs/DITBlogs/app/api/posts/[id]/publish/route.ts
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
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
        include: { tags: { select: { id: true } } }, // FIX 1: include tags from draft
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

    // FIX 1: Tag sync payload for Prisma
    const tagSync = {
        set: draft.tags.map((t) => ({ id: t.id })),
    };

    let publishedPost;

    if (draft.postId) {
        // FIX 2: Fetch the EXISTING post's slug BEFORE updating,
        // so we can invalidate the old cache key if the slug changed.
        const existingPost = await db.post.findUnique({
            where: { id: draft.postId },
            select: { slug: true },
        });

        publishedPost = await db.post.update({
            where: { id: draft.postId },
            data: {
                ...postData,
                tags: tagSync, // FIX 1: sync tags on update
            },
        });

        // FIX 2: If slug changed, delete the stale old-slug cache key too
        if (existingPost && existingPost.slug !== publishedPost.slug) {
            await redis.del(`v2:post:${publishedPost.organizationId}:${existingPost.slug}`);
            await redis.del(`post:${existingPost.slug}`);
        }

        await db.draft.delete({ where: { id } });
    } else {
        publishedPost = await db.post.create({
            data: {
                ...postData,
                tags: tagSync, // FIX 1: connect tags on create
            },
        });
        await db.draft.delete({ where: { id } });
    }

    // Invalidate cache for the new/current slug
    await redis.del(`v2:post:${publishedPost.organizationId}:${publishedPost.slug}`);
    await redis.del(`post:${publishedPost.slug}`);

    const keys = await redis.keys(`v2:posts:${publishedPost.organizationId}:*`);
    if (keys.length > 0) await redis.del(keys);

    await triggerWebhooks(publishedPost.organizationId, 'post.published', { post: publishedPost });

    return NextResponse.json(publishedPost);
}
