// app/api/v1/newsletter/subscribe/route.ts (NEW FILE)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { sendWelcomeEmail } from "@/lib/email"; // Assuming this function exists
import { authenticateAndCheckUsage } from "@/lib/api/v1/auth"; // Your main V1 auth middleware

const subscribeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate the request via API Key to identify the organization and apply rate limits.
  // This is a public endpoint, but the API key from the frontend (WhatsYour.Info)
  // tells us WHICH organization's newsletter to subscribe to.
  const authResult = await authenticateAndCheckUsage(req);
  if (authResult.error || !authResult.org) {
    return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: authResult.status || 401 });
  }
  
  const { org } = authResult;

  try {
    const body = await req.json();
    const validated = subscribeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten().fieldErrors.email?.[0] }, { status: 400 });
    }

    const { email, name } = validated.data;

    // 2. Check for an existing subscriber within THIS organization
    const existingSubscriber = await db.newsletter.findFirst({
      where: {
        email: email,
        organizationId: org.id,
      },
    });

    if (existingSubscriber) {
      // If they were previously unsubscribed, reactivate them.
      if (!existingSubscriber.active) {
        await db.newsletter.update({
          where: { id: existingSubscriber.id },
          data: { active: true },
        });
        // We typically don't send a full "welcome" email on reactivation.
        return NextResponse.json({ message: "Subscription reactivated successfully." });
      }
      // If they are already active, just let them know.
      return NextResponse.json({ message: "You are already subscribed." }, { status: 409 });
    }

    // 3. Create a new subscriber for this organization
    await db.newsletter.create({
      data: {
        email,
        name: name || "",
        active: true,
        organizationId: org.id, // Link to the authenticated organization
      },
    });

    // 4. Send the welcome email
    try {
        await sendWelcomeEmail({
            to: email,
            organizationName: org.name,
        });
    } catch (emailError) {
        console.error(`[V1_NEWSLETTER] Failed to send welcome email to ${email} for org ${org.id}:`, emailError);
        // We don't fail the request if the email fails, as the user is already subscribed.
        // This could be a spot for more robust error logging (e.g., Sentry).
    }
    
    // 5. Invalidate any relevant stats caches (optional but good practice)
    await redis.del(`newsletter_stats:${org.id}`);

    return NextResponse.json({ message: "Subscribed successfully! Please check your inbox for a welcome email." }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // This is a fallback, but the safeParse above should catch it first.
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error("[V1_NEWSLETTER_ERROR]", error);
    return NextResponse.json({ error: "An internal error occurred. Please try again later." }, { status: 500 });
  }
}