import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { requestId } = params
    const { action } = await req.json() // 'approve' | 'reject'

    if (!["approve", "reject"].includes(action)) {
      return new NextResponse("Invalid action.", { status: 400 })
    }

    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (admin?.role !== "ORG_ADMIN" || !admin.organizationId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const result = await db.$transaction(async (tx) => {
      const request = await tx.membershipRequest.findFirst({
        where: { id: requestId, organizationId: admin.organizationId, status: "PENDING" },
      })

      if (!request) throw new Error("Request not found or already handled.")

      if (action === "approve") {
        const targetUser = await tx.user.findUnique({
          where: { id: request.userId },
          select: { organizationId: true },
        })

        // Only update the active org if the user doesn't have one yet
        const shouldSetActive = !targetUser?.organizationId

        if (shouldSetActive) {
          await tx.user.update({
            where: { id: request.userId },
            data: {
              organizationId: admin.organizationId!,
              role: UserRole.WRITER,
              membershipStatus: "APPROVED",
            },
          })
        }

        // Upsert UserOrganization to APPROVED
        await tx.userOrganization.upsert({
          where: {
            userId_organizationId: {
              userId: request.userId,
              organizationId: admin.organizationId!,
            },
          },
          update: { role: UserRole.WRITER, membershipStatus: "APPROVED" },
          create: {
            userId: request.userId,
            organizationId: admin.organizationId!,
            role: UserRole.WRITER,
            membershipStatus: "APPROVED",
          },
        })

        return tx.membershipRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED" },
        })
      } else {
        // On reject, update UserOrganization to REJECTED too
        await tx.userOrganization.upsert({
          where: {
            userId_organizationId: {
              userId: request.userId,
              organizationId: admin.organizationId!,
            },
          },
          update: { membershipStatus: "REJECTED" },
          create: {
            userId: request.userId,
            organizationId: admin.organizationId!,
            membershipStatus: "REJECTED",
          },
        })

        return tx.membershipRequest.update({
          where: { id: requestId },
          data: { status: "REJECTED" },
        })
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[REQUESTS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
