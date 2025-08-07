import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find invites that match the user's ID OR their email and are still pending.
    // This covers cases where the user signed up after the invite was sent.
    const invites = await db.invite.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { invitedUserId: session.user.id },
          { email: session.user.email },
        ],
      },
      include: {
        // We need the organization's name to display it in the UI
        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("[USER_INVITES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}