import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const memberships = await db.userOrganization.findMany({
      where: {
        userId: session.user.id,
        membershipStatus: "APPROVED",
      },
      include: {
        organization: {
          select: { id: true, name: true, website: true, plan: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    })

    return NextResponse.json(
      memberships.map((m) => ({
        id: m.organizationId,
        name: m.organization.name,
        website: m.organization.website,
        plan: m.organization.plan,
        role: m.role,
        joinedAt: m.joinedAt,
        isActive: m.organizationId === session.user.organizationId,
      }))
    )
  } catch (error) {
    console.error("[USER_ORGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
