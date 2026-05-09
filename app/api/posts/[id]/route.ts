import { db } from "@/lib/db";
import { invalidatePostCache, invalidateAllPostsCache } from "@/lib/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { canUserPerformAction } from "@/lib/api/user";

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
        organizationId: user.organizationId,
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
    const { authorId, organizationId, ...updateData } = body;

    const updatedPost = await db.post.update({
      where: { id: postId },
      data: updateData,
    });

    await invalidatePostCache(updatedPost.slug);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("[POST_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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

    const postToDelete = await db.post.findUnique({
      where: { id: postId },
      select: { slug: true },
    });

    if (!postToDelete) {
      return new NextResponse("Post not found", { status: 404 });
    }

    await db.post.delete({ where: { id: postId } });

    await invalidatePostCache(postToDelete.slug);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
