import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { organizationId, message } = body;

    if (!organizationId) {
      return new NextResponse("Organization ID is required", { status: 400 });
    }

    // Use a transaction to ensure both operations succeed or fail together
    const [request] = await db.$transaction([
      db.membershipRequest.create({
        data: {
          organizationId,
          userId: session.user.id,
          message: message || null,
        },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { onboardingCompleted: true },
      }),
    ]);
    
    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("[ONBOARDING_REQUEST_JOIN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}