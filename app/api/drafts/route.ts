import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// GET handler to fetch all drafts for the current user in their organization
export async function GET() {
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
      return NextResponse.json([]); // No org, no drafts
    }

    const drafts = await db.draft.findMany({
      where: {
        authorId: session.user.id,
        organizationId: user.organizationId
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("[DRAFTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: {id: session.user.id}, select: { organizationId: true } });
    if (!user?.organizationId) return new NextResponse("User not in an org", { status: 403 });

    const body = await req.json();

    const newDraft = await db.draft.create({
        data: { ...body, authorId: session.user.id, organizationId: user.organizationId }
    });
    return NextResponse.json(newDraft);
}
