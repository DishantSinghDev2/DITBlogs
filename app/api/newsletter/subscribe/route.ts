import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { redis } from "@/lib/redis"

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = subscribeSchema.parse(body)

    // Check if email already exists
    const existingSubscriber = await db.newsletter.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      // If already subscribed but inactive, reactivate
      if (!existingSubscriber.active) {
        await db.newsletter.update({
          where: { email },
          data: { active: true },
        })

        return NextResponse.json({ message: "Subscription reactivated successfully" })
      }

      return NextResponse.json({ message: "Email already subscribed" })
    }

    // Create new subscriber
    await db.newsletter.create({
      data: {
        email,
        name: name || "",
        active: true,
      },
    })

    // Clear cache if needed
    await redis.del("newsletter_stats")

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
