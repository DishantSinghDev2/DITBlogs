import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";
import { sendInviteEmail } from "@/lib/email"; // <-- Import the mailer function

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { email } = await req.json();
        if (!email) return new NextResponse("Email is required", { status: 400 });

        const admin = await db.user.findUnique({
            where: { id: session.user.id },
            // FIX: Include organization details to get the name for the email
            include: { organization: { select: { id: true, name: true } } },
        });
        
        const orgId = admin?.organization?.id;
        const orgName = admin?.organization?.name;

        if (!orgId || !orgName) {
            return new NextResponse("Admin not in an organization", { status: 403 });
        }

        const canInvite = await canUserPerformAction(session.user.id, "org:manage_members", orgId);
        if (!canInvite) return new NextResponse("Forbidden", { status: 403 });

        // Check if the user with this email already exists and is in an organization
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser?.organizationId) {
            return new NextResponse("This user is already a member of an organization.", { status: 409 });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await db.invite.create({
            data: { email, organizationId: orgId, invitedUserId: existingUser?.id, expiresAt },
        });

        // --- FIX: Send the invitation email after creating the invite in the DB ---
        await sendInviteEmail({ to: email, organizationName: orgName });

        return NextResponse.json(invite);

    } catch (error) {
        console.error("[INVITES_POST]", error);
        // Provide a more specific error if email fails
        if (error instanceof Error && error.message.includes("email")) {
            return new NextResponse(error.message, { status: 500 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}