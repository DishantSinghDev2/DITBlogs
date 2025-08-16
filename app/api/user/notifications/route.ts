// /api/user/notifications/route.ts
// (This code is correct and will now work with the new model)

import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import * as z from "zod";

const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  newComment: z.boolean(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = notificationsSchema.parse(body);

    // This upsert operation will now succeed because `userId` is a unique key
    await db.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data,
      },
    });

    return new NextResponse("OK");
  } catch (error) {
     if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }
    console.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
