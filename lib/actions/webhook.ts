// lib/actions/webhook.ts (Create this new file)
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { canUserPerformAction } from "@/lib/api/user";
import { revalidatePath } from "next/cache";

const webhookSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  orgId: z.string(),
});

export async function createWebhook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validatedFields = webhookSchema.safeParse({
    url: formData.get("url"),
    orgId: formData.get("orgId"),
  });

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.flatten().fieldErrors.url?.[0]);
  }

  const { url, orgId } = validatedFields.data;

  const canCreate = await canUserPerformAction(session.user.id, "org:edit_settings", orgId);
  if (!canCreate) throw new Error("Forbidden");

  await db.webhook.create({
    data: { url, organizationId: orgId },
  });

  revalidatePath("/dashboard/settings/organization");
}

export async function deleteWebhook(webhookId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const webhook = await db.webhook.findUnique({
        where: { id: webhookId },
        select: { organizationId: true }
    });
    
    if (!webhook) throw new Error("Webhook not found.");

    const canDelete = await canUserPerformAction(session.user.id, "org:edit_settings", webhook.organizationId);
    if (!canDelete) throw new Error("Forbidden");

    await db.webhook.delete({ where: { id: webhookId } });

    revalidatePath("/dashboard/settings/organization");
}