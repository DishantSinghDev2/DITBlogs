import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { canUserPerformAction } from "@/lib/api/user"; // Correct permission checker

// --- GET handler for fetching a single post by ID ---
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return new NextResponse("User is not part of an organization", { status: 403 });
    }

    const postId = params.id;
    const post = await db.post.findFirst({
      where: {
        id: postId,
        organizationId: user.organizationId, // Security: Scope to user's org
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: true,
        tags: true,
        _count: { select: { comments: true, views: true } },
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- PUT handler for updating an existing post ---
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.id;
    const canEdit = await canUserPerformAction(session.user.id, "post:edit", postId);

    if (!canEdit) {
      return new NextResponse("Forbidden: You do not have permission to edit this post.", { status: 403 });
    }

    const body = await req.json();
    // Prevent changing critical, immutable fields on update
    const { authorId, organizationId, ...updateData } = body;

    const updatedPost = await db.post.update({
      where: { id: postId },
      data: updateData,
    });

    // Invalidate caches
    await redis.del(`post:${updatedPost.slug}`);
    await redis.del("featured_posts");

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("[POST_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- DELETE handler for deleting an existing post ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.id;
    const canDelete = await canUserPerformAction(session.user.id, "post:delete", postId);

    if (!canDelete) {
      return new NextResponse("Forbidden: You do not have permission to delete this post.", { status: 403 });
    }

    // We must fetch the post first to get its slug for cache invalidation
    const postToDelete = await db.post.findUnique({
      where: { id: postId },
      select: { slug: true },
    });

    if (!postToDelete) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Now, delete the post
    await db.post.delete({
      where: { id: postId },
    });

    // Invalidate caches using the fetched slug
    await redis.del(`post:${postToDelete.slug}`);
    await redis.del("featured_posts");

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}