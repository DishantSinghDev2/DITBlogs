import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import * as z from "zod";

const updateSchema = z.object({
  id: z.string().optional(),
  all: z.boolean().optional(),
});

// PUT handler to mark notifications as read
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, all } = updateSchema.parse(body);

    if (all) {
      // Mark all of the user's notifications as read
      await db.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      });
    } else if (id) {
      // Mark a single notification as read, ensuring it belongs to the user
      await db.notification.update({
        where: { id, userId: session.user.id },
        data: { read: true },
      });
    } else {
      return new NextResponse("Invalid request", { status: 400 });
    }

    return new NextResponse("OK");
  } catch (error) {
    console.error("[NOTIFICATIONS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}