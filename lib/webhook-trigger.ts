// lib/webhook-trigger.ts (Create this new file)
import { db } from "@/lib/db";
import crypto from "crypto";
import { Post } from "@prisma/client";

type WebhookEvent = "post.published" | "post.unpublished";

// This is the function you will call from your API routes
export async function triggerWebhooks(organizationId: string, event: WebhookEvent, payload: { post: Post }) {
  const webhooks = await db.webhook.findMany({
    where: { organizationId },
  });

  if (webhooks.length === 0) return;

  const eventData = {
    event,
    timestamp: new Date().toISOString(),
    payload,
  };

  for (const webhook of webhooks) {
    try {
      const body = JSON.stringify(eventData);
      
      // Sign the payload with the webhook's secret key
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DITBlogs-Signature": signature, // Send the signature as a header
        },
        body,
      });

      // Log the event for auditing and debugging purposes
      await db.webhookEvent.create({
        data: {
          webhookId: webhook.id,
          eventType: event,
          payload: eventData,
          delivered: response.ok,
          deliveredAt: new Date(),
          responseStatus: response.status,
          responseBody: await response.text(),
        },
      });

    } catch (error: any) {
      console.error(`Failed to send webhook to ${webhook.url}:`, error);
      await db.webhookEvent.create({
        data: {
          webhookId: webhook.id,
          eventType: event,
          payload: eventData,
          delivered: false,
          responseStatus: 500,
          responseBody: error.message,
        },
      });
    }
  }
}