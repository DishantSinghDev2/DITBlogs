import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import { sendInviteEmail } from "@/lib/email"
import { generateToken } from "@/lib/jwt"

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["editor", "writer"]),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { email, role } = inviteSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create invite
    const invite = await db.invite.create({
      data: {
        email,
        role,
        token: await generateToken({ email, role }),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Send invite email
    await sendInviteEmail(email, invite.token, role)

    return NextResponse.json({ message: "Invite sent successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Invite error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
