import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

// PATCH handler to Approve or Reject a request
export async function PATCH(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { requestId } = params;
    const { action } = await req.json(); // Expecting { action: 'approve' | 'reject' }

    if (!['approve', 'reject'].includes(action)) {
        return new NextResponse("Invalid action.", { status: 400 });
    }

    const admin = await db.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true, role: true },
    });

    if (admin?.role !== "ORG_ADMIN" || !admin.organizationId) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Use a transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      const request = await tx.membershipRequest.findFirst({
        where: { id: requestId, organizationId: admin.organizationId, status: 'PENDING' }
      });

      if (!request) throw new Error("Request not found or already handled.");

      if (action === 'approve') {
        // Add user to the organization with a default role
        await tx.user.update({
          where: { id: request.userId },
          data: {
            organizationId: admin.organizationId,
            role: UserRole.WRITER, // Assign a default role
          },
        });
        // Update the request status
        return tx.membershipRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
        });
      } else { // 'reject'
        return tx.membershipRequest.update({
          where: { id: requestId },
          data: { status: 'REJECTED' },
        });
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[REQUESTS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}