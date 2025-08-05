import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { checkUserRole } from "@/lib/api/user"

const affiliateLinkSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  url: z.string().url("Please enter a valid URL"),
  description: z.string().optional(),
  shortCode: z.string().min(2, "Short code must be at least 2 characters"),
  active: z.boolean().optional(),
})

// GET handler for fetching affiliate links
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has appropriate role
    const isAdminOrEditor =
      (await checkUserRole(session.user.id, "admin")) || (await checkUserRole(session.user.id, "editor"))

    if (!isAdminOrEditor) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Get affiliate links
    const affiliateLinks = await db.affiliateLink.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(affiliateLinks)
  } catch (error) {
    console.error("Error fetching affiliate links:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate links" }, { status: 500 })
  }
}

// POST handler for creating a new affiliate link
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has appropriate role
    const isAdminOrEditor =
      (await checkUserRole(session.user.id, "admin")) || (await checkUserRole(session.user.id, "editor"))

    if (!isAdminOrEditor) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = affiliateLinkSchema.parse(body)

    // Check if short code already exists
    const existingLink = await db.affiliateLink.findUnique({
      where: { shortCode: validatedData.shortCode },
    })

    if (existingLink) {
      return NextResponse.json({ error: "Short code already exists" }, { status: 409 })
    }

    // Create affiliate link
    const affiliateLink = await db.affiliateLink.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        description: validatedData.description || "",
        shortCode: validatedData.shortCode,
        active: validatedData.active ?? true,
      },
    })

    return NextResponse.json(affiliateLink, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error creating affiliate link:", error)
    return NextResponse.json({ error: "Failed to create affiliate link" }, { status: 500 })
  }
}

// PUT handler for updating an affiliate link
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has appropriate role
    const isAdminOrEditor =
      (await checkUserRole(session.user.id, "admin")) || (await checkUserRole(session.user.id, "editor"))

    if (!isAdminOrEditor) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = affiliateLinkSchema.parse(body)

    if (!validatedData.id) {
      return NextResponse.json({ error: "Affiliate link ID is required" }, { status: 400 })
    }

    // Check if affiliate link exists
    const existingLink = await db.affiliateLink.findUnique({
      where: { id: validatedData.id },
    })

    if (!existingLink) {
      return NextResponse.json({ error: "Affiliate link not found" }, { status: 404 })
    }

    // Check if short code is already taken by another link
    if (validatedData.shortCode !== existingLink.shortCode) {
      const shortCodeExists = await db.affiliateLink.findFirst({
        where: {
          shortCode: validatedData.shortCode,
          id: { not: validatedData.id },
        },
      })

      if (shortCodeExists) {
        return NextResponse.json({ error: "Short code already exists" }, { status: 409 })
      }
    }

    // Update affiliate link
    const affiliateLink = await db.affiliateLink.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        url: validatedData.url,
        description: validatedData.description || existingLink.description,
        shortCode: validatedData.shortCode,
        active: validatedData.active ?? existingLink.active,
      },
    })

    return NextResponse.json(affiliateLink)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error updating affiliate link:", error)
    return NextResponse.json({ error: "Failed to update affiliate link" }, { status: 500 })
  }
}

// DELETE handler for deleting an affiliate link
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(session.user.id, "admin")

    if (!isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Affiliate link ID is required" }, { status: 400 })
    }

    // Check if affiliate link exists
    const existingLink = await db.affiliateLink.findUnique({
      where: { id },
    })

    if (!existingLink) {
      return NextResponse.json({ error: "Affiliate link not found" }, { status: 404 })
    }

    // Delete affiliate link
    await db.affiliateLink.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Affiliate link deleted successfully" })
  } catch (error) {
    console.error("Error deleting affiliate link:", error)
    return NextResponse.json({ error: "Failed to delete affiliate link" }, { status: 500 })
  }
}
