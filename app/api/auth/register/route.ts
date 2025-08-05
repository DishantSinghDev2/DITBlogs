import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcrypt"
import { z } from "zod"

import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user", // Default role
      },
    })

    // Send verification email
    await sendVerificationEmail(email)

    return NextResponse.json({ message: "User created successfully. Please verify your email." }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
