import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER_POST]", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
