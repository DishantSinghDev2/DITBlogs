import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

/**
 * POST /api/drafts/new
 * Creates a blank draft immediately and returns its ID so the client can
 * redirect to /dashboard/editor/[id] before the user has typed anything.
 * All fields use safe placeholder values; the editor overwrites them on first save.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    })
    if (!user?.organizationId) {
      return new NextResponse("User is not part of an organization", { status: 403 })
    }

    const slug = `untitled-${Date.now()}`

    const draft = await db.draft.create({
      data: {
        title: "Untitled Post",
        slug,
        content: "",
        authorId: session.user.id,
        organizationId: user.organizationId,
      },
      select: { id: true },
    })

    return NextResponse.json({ id: draft.id }, { status: 201 })
  } catch (error) {
    console.error("[DRAFTS_NEW_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
