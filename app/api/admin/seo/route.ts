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
      metaTitle,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonicalUrl,
      robotsTxt,
      sitemapEnabled,
      schemaOrgEnabled,
      googleAnalyticsId,
      googleTagManagerId,
      metaPixelId,
    } = await req.json()

    // Update site config
    await db.seo.update({
      where: { id: 1 },
      data: {
          metaTitle,
          metaDescription,
          ogTitle,
          ogDescription,
          ogImage,
          twitterTitle,
          twitterDescription,
          twitterImage,
          canonicalUrl,
          robotsTxt,
          sitemapEnabled,
          schemaOrgEnabled,
          googleAnalyticsId,
          googleTagManagerId,
          metaPixelId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("SEO settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
