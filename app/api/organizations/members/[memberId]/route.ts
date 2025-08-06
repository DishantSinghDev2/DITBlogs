import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

// --- PUT handler to UPDATE a member's role ---
export async function PUT(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { memberId } = params;
    const { role } = await req.json();

    if (!role || !Object.values(UserRole).includes(role)) {
      return new NextResponse("Invalid role provided", { status: 400 });
    }

    // 1. Get the admin's organization context
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    // 2. Security Check: Ensure the requester is an ORG_ADMIN of an organization
    if (!admin?.organizationId || admin.role !== "ORG_ADMIN") {
      return new NextResponse("Forbidden: You are not an organization admin.", { status: 403 });
    }

    // 3. Prevent an admin from changing their own role via this endpoint
    if (memberId === session.user.id) {
        return new NextResponse("Admins cannot change their own role.", {status: 403});
    }

    // 4. Update the user's role, but verify they belong to the admin's organization
    const updatedUser = await db.user.update({
      where: {
        id: memberId,
        organizationId: admin.organizationId, // CRUCIAL: Ensures admin can only edit users in their own org
      },
      data: {
        role: role,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[MEMBERS_PUT]", error);
    // Handle cases where the user to update is not found in the org
    return new NextResponse("Internal Error or Member not found in your organization", { status: 500 });
  }
}

// --- DELETE handler to REMOVE a member from the organization ---
export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { memberId } = params;

    // 1. Get the admin's organization context
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    // 2. Security Check
    if (!admin?.organizationId || admin.role !== "ORG_ADMIN") {
      return new NextResponse("Forbidden: You are not an organization admin.", { status: 403 });
    }
    
    // 3. Prevent admin from removing themselves
    if(memberId === session.user.id) {
        return new NextResponse("Admins cannot remove themselves from the organization.", { status: 403 });
    }

    // 4. REMOVE the user from the organization by setting their orgId and role to null
    // This is NON-DESTRUCTIVE. The user account still exists.
    const updatedUser = await db.user.update({
        where: {
            id: memberId,
            organizationId: admin.organizationId, // CRUCIAL security check
        },
        data: {
            organizationId: null,
            role: null,
        }
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("[MEMBERS_DELETE]", error);
    return new NextResponse("Internal Error or Member not found in your organization", { status: 500 });
  }
}