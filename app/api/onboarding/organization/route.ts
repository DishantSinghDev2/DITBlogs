import { db } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { Plan, UserRole } from "@prisma/client"
import { invalidateOrgCache } from "@/lib/cache"

// Account that gets CUSTOM plan on every org it creates
const CUSTOM_PLAN_EMAIL = "dishantsinghdev@icloud.com"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { orgName, website } = await req.json()

    if (!orgName || !website) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const plan: Plan =
      session.user.email === CUSTOM_PLAN_EMAIL ? Plan.CUSTOM : Plan.FREE

    const newOrganization = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: orgName, website, ownerId: session.user.id, plan },
      })

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          onboardingCompleted: true,
          organizationId: organization.id,
          role: UserRole.ORG_ADMIN,
          membershipStatus: "APPROVED",
        },
      })

      await tx.userOrganization.upsert({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: organization.id,
          },
        },
        update: {
          role: UserRole.ORG_ADMIN,
          membershipStatus: "APPROVED",
        },
        create: {
          userId: session.user.id,
          organizationId: organization.id,
          role: UserRole.ORG_ADMIN,
          membershipStatus: "APPROVED",
        },
      })

      return organization
    })

    await invalidateOrgCache(newOrganization.id)

    return NextResponse.json(newOrganization, { status: 201 })
  } catch (error: any) {
    console.error("[ONBOARDING_ORGANIZATION_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
