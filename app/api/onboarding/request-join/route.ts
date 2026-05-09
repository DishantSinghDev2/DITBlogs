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

    const { organizationId, message } = await req.json()

    if (!organizationId) {
      return new NextResponse("Organization ID is required", { status: 400 })
    }

    // Check org exists
    const org = await db.organization.findUnique({ where: { id: organizationId } })
    if (!org) {
      return new NextResponse("Organization not found", { status: 404 })
    }

    // Prevent duplicate pending request
    const existing = await db.membershipRequest.findUnique({
      where: { userId_organizationId: { userId: session.user.id, organizationId } },
    })
    if (existing) {
      return new NextResponse("A request already exists for this organization.", { status: 409 })
    }

    const [request] = await db.$transaction([
      db.membershipRequest.create({
        data: {
          organizationId,
          userId: session.user.id,
          message: message || null,
        },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { onboardingCompleted: true },
      }),
      // Create UserOrganization with PENDING status
      db.userOrganization.upsert({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId,
          },
        },
        update: { membershipStatus: "PENDING" },
        create: {
          userId: session.user.id,
          organizationId,
          membershipStatus: "PENDING",
        },
      }),
    ])

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error("[ONBOARDING_REQUEST_JOIN_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
