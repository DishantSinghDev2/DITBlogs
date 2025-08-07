import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { error, status, org, warning } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status });
  }

  // --- Increment the usage counter ---
  // We do this first. It's an atomic operation and very fast.
  await db.organization.update({
    where: { id: org.id },
    data: { monthlyPostViews: { increment: 1 } },
  });

  const post = await db.post.findFirst({
    where: { organizationId: org.id, slug: params.slug, published: true },
    select: { /* public-safe fields */ title: true, slug: true, content: true, publishedAt: true }
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const response = NextResponse.json(post);
  if (warning) {
    response.headers.set('X-Usage-Warning', warning);
  }
  return response;
}