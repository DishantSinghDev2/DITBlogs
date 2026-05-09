import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function PUT(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { memberId } = params
    const { role } = await req.json()

    if (!role || !Object.values(UserRole).includes(role)) {
      return new NextResponse("Invalid role provided", { status: 400 })
    }

    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (!admin?.organizationId || admin.role !== "ORG_ADMIN") {
      return new NextResponse("Forbidden: You are not an organization admin.", { status: 403 })
    }

    if (memberId === session.user.id) {
      return new NextResponse("Admins cannot change their own role.", { status: 403 })
    }

    // Update both User (active org) and UserOrganization
    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: memberId, organizationId: admin.organizationId },
        data: { role },
      }),
      db.userOrganization.updateMany({
        where: { userId: memberId, organizationId: admin.organizationId },
        data: { role },
      }),
    ])

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[MEMBERS_PUT]", error)
    return new NextResponse("Internal Error or Member not found in your organization", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { memberId } = params

    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (!admin?.organizationId || admin.role !== "ORG_ADMIN") {
      return new NextResponse("Forbidden: You are not an organization admin.", { status: 403 })
    }

    if (memberId === session.user.id) {
      return new NextResponse("Admins cannot remove themselves from the organization.", { status: 403 })
    }

    // Verify member belongs to this org
    const member = await db.user.findFirst({
      where: { id: memberId, organizationId: admin.organizationId },
      select: { id: true },
    })

    if (!member) {
      return new NextResponse("Member not found in your organization.", { status: 404 })
    }

    // Remove from active context; keep UserOrganization so history is preserved
    // but mark it so they can no longer access the org
    await db.$transaction([
      db.user.update({
        where: { id: memberId },
        data: { organizationId: null, role: null, membershipStatus: "PENDING" },
      }),
      db.userOrganization.updateMany({
        where: { userId: memberId, organizationId: admin.organizationId },
        data: { membershipStatus: "REJECTED" },
      }),
    ])

    return NextResponse.json({ message: "Member removed successfully" })
  } catch (error) {
    console.error("[MEMBERS_DELETE]", error)
    return new NextResponse("Internal Error or Member not found in your organization", { status: 500 })
  }
}
