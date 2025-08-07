import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: { inviteId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { inviteId } = params;
        const { action } = await req.json(); // 'accept' or 'decline'

        const invite = await db.invite.findFirst({
            where: { id: inviteId, OR: [{ email: session.user.email! }, { invitedUserId: session.user.id }] }
        });
        if (!invite) return new NextResponse("Invite not found or not for you.", { status: 404 });

        if (action === 'accept') {
            await db.$transaction([
                db.user.update({
                    where: { id: session.user.id },
                    data: {
                        organizationId: invite.organizationId,
                        role: UserRole.WRITER, // Default role
                        onboardingCompleted: true,
                    },
                }),
                db.invite.update({
                    where: { id: inviteId },
                    data: { status: 'ACCEPTED' },
                }),
            ]);
        } else { // decline
            await db.invite.update({ where: { id: inviteId }, data: { status: 'DECLINED' } });
        }
        return new NextResponse("OK");
    } catch (error) {
        console.error("[INVITE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}