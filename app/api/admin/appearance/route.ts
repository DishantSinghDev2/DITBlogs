import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { checkUserRole } from "@/lib/api/user"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(session.user.id, "admin")

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const {
      theme,
      primaryColor,
      secondaryColor,
      accentColor,
      fontHeading,
      fontBody,
      borderRadius,
      headerLayout,
      footerLayout,
      customCss,
    } = await req.json()

    // Update site config
    await db.siteConfig.update({
      where: { id: 1 },
      data: {
        appearance: {
          theme,
          primaryColor,
          secondaryColor,
          accentColor,
          fontHeading,
          fontBody,
          borderRadius,
          headerLayout,
          footerLayout,
          customCss,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Appearance settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
