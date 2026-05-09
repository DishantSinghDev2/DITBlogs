import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { organizationId } = await req.json()

    if (!organizationId) {
      return new NextResponse("Organization ID is required", { status: 400 })
    }

    // Verify the user is an APPROVED member of the target org
    const membership = await db.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    })

    if (!membership || membership.membershipStatus !== "APPROVED") {
      return new NextResponse("Forbidden: you are not an approved member of this organization.", { status: 403 })
    }

    // Update active org context on the user record
    await db.user.update({
      where: { id: session.user.id },
      data: {
        organizationId,
        role: membership.role,
        membershipStatus: "APPROVED",
      },
    })

    return NextResponse.json({ success: true, organizationId, role: membership.role })
  } catch (error) {
    console.error("[SWITCH_ORG_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
