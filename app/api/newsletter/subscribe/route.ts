import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { sendWelcomeEmail } from "@/lib/email"; // <-- Import the new function

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  // FIX: The frontend must now send the organizationId it's subscribing to
  organizationId: z.string().min(1, "Organization ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, organizationId } = subscribeSchema.parse(body);

    const organization = await db.organization.findUnique({
        where: { id: organizationId },
        select: { name: true }
    });
    if (!organization) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const existingSubscriber = await db.newsletter.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.organizationId !== organizationId) {
          return NextResponse.json({ error: "This email is subscribed to another newsletter." }, { status: 409 });
      }

      if (!existingSubscriber.active) {
        await db.newsletter.update({
          where: { email },
          data: { active: true },
        });
        // Don't send a welcome email on reactivation, just a success message.
        return NextResponse.json({ message: "Subscription reactivated successfully" });
      }
      return NextResponse.json({ message: "Email already subscribed" });
    }

    // --- FIX: Create new subscriber AND send the welcome email ---
    await db.newsletter.create({
      data: {
        email,
        name: name || "",
        active: true,
        organizationId: organizationId, // Link to the organization
      },
    });

    // Send the welcome email
    await sendWelcomeEmail({
        to: email,
        organizationName: organization.name,
    });


    // Clear cache if needed (optional)
    await redis.del(`newsletter_stats:${organizationId}`);

    return NextResponse.json({ message: "Subscribed successfully! Please check your inbox." }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
