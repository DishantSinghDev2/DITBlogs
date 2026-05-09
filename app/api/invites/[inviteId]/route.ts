import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function PATCH(req: Request, { params }: { params: { inviteId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    const { inviteId } = params
    const { action } = await req.json() // 'accept' | 'decline'

    if (!["accept", "decline"].includes(action)) {
      return new NextResponse("Invalid action.", { status: 400 })
    }

    const invite = await db.invite.findFirst({
      where: {
        id: inviteId,
        OR: [{ email: session.user.email! }, { invitedUserId: session.user.id }],
      },
    })

    if (!invite) return new NextResponse("Invite not found or not for you.", { status: 404 })

    if (invite.status !== "PENDING") {
      return new NextResponse("Invite has already been responded to.", { status: 409 })
    }

    if (action === "accept") {
      // User may or may not have an active org already — only update active if they don't
      const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      })

      const shouldSetActive = !currentUser?.organizationId

      await db.$transaction([
        ...(shouldSetActive
          ? [
              db.user.update({
                where: { id: session.user.id },
                data: {
                  organizationId: invite.organizationId,
                  role: UserRole.WRITER,
                  onboardingCompleted: true,
                  membershipStatus: "APPROVED",
                },
              }),
            ]
          : [
              db.user.update({
                where: { id: session.user.id },
                data: { onboardingCompleted: true },
              }),
            ]),
        db.invite.update({ where: { id: inviteId }, data: { status: "ACCEPTED" } }),
        // Upsert UserOrganization
        db.userOrganization.upsert({
          where: {
            userId_organizationId: {
              userId: session.user.id,
              organizationId: invite.organizationId,
            },
          },
          update: { role: UserRole.WRITER, membershipStatus: "APPROVED" },
          create: {
            userId: session.user.id,
            organizationId: invite.organizationId,
            role: UserRole.WRITER,
            membershipStatus: "APPROVED",
          },
        }),
      ])
    } else {
      await db.invite.update({ where: { id: inviteId }, data: { status: "DECLINED" } })
    }

    return new NextResponse("OK")
  } catch (error) {
    console.error("[INVITE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
