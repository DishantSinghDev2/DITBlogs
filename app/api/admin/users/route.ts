import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { hash } from "bcrypt"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { checkUserRole } from "@/lib/api/user"

const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "writer", "editor", "admin"]).optional(),
  password: z.string().min(8).optional(),
})

// GET handler for fetching users
export async function GET(req: NextRequest) {
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
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role")

    // Build query
    const query: any = {}

    if (search) {
      query.OR = [{ name: { contains: search } }, { email: { contains: search } }]
    }

    if (role) {
      query.role = role
    }

    // Get users
    const users = await db.user.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count
    const total = await db.user.count({
      where: query,
    })

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// PUT handler for updating a user
export async function PUT(req: NextRequest) {
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

    const body = await req.json()
    const { id, name, email, role, password } = userUpdateSchema.parse(body)

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent changing own role (admin can't demote themselves)
    if (id === session.user.id && role && role !== "admin") {
      return NextResponse.json({ error: "You cannot change your own admin role" }, { status: 403 })
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role

    // Hash password if provided
    if (password) {
      updateData.password = await hash(password, 10)
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE handler for deleting a user
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
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Prevent deleting self
    if (id === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 403 })
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
