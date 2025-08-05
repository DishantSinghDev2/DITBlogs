import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import slugify from "slugify"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { checkUserRole } from "@/lib/api/user"

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
})

// GET handler for fetching categories
export async function GET(req: NextRequest) {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST handler for creating a new category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or editor
    const isAdminOrEditor =
      (await checkUserRole(session.user.id, "admin")) || (await checkUserRole(session.user.id, "editor"))

    if (!isAdminOrEditor) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = categorySchema.parse(body)

    // Generate slug if not provided
    const slug = validatedData.slug || slugify(validatedData.name, { lower: true })

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 409 })
    }

    // Create the category
    const category = await db.category.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || "",
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

// PUT handler for updating a category
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or editor
    const isAdminOrEditor =
      (await checkUserRole(session.user.id, "admin")) || (await checkUserRole(session.user.id, "editor"))

    if (!isAdminOrEditor) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = categorySchema.parse(body)

    if (!validatedData.id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id: validatedData.id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Generate slug if name is changed
    let slug = existingCategory.slug
    if (validatedData.name !== existingCategory.name) {
      slug = validatedData.slug || slugify(validatedData.name, { lower: true })

      // Check if new slug already exists
      const slugExists = await db.category.findFirst({
        where: {
          slug,
          id: { not: validatedData.id },
        },
      })

      if (slugExists) {
        return NextResponse.json({ error: "Category with this slug already exists" }, { status: 409 })
      }
    }

    // Update the category
    const category = await db.category.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || existingCategory.description,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE handler for deleting a category
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
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if category has posts
    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with associated posts. Please reassign posts first.",
        },
        { status: 400 },
      )
    }

    // Delete the category
    await db.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
