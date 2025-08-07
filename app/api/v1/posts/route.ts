import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth";

export async function GET(req: NextRequest) {
  const { error, status, org, warning } = await authenticateAndCheckUsage(req);
  if (error || !org) {
    return NextResponse.json({ error }, { status });
  }

  const posts = await db.post.findMany({
    where: { organizationId: org.id, published: true },
    select: { /* select only public-safe fields */ title: true, slug: true, content: true, publishedAt: true }
  });

  const response = NextResponse.json(posts);
  if (warning) {
    response.headers.set('X-Usage-Warning', warning);
  }
  return response;
}