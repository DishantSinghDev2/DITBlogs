import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id)
            return new NextResponse("Unauthorized", { status: 401 });

        const admin = await db.user.findUnique({
            where: { id: session.user.id },
            select: { organizationId: true },
        });
        const orgId = admin?.organizationId;
        if (!orgId)
            return new NextResponse("Admin not in an organization", { status: 403 });

        const canManage = await canUserPerformAction(
            session.user.id,
            "org:edit_settings",
            orgId
        );
        if (!canManage)
            return new NextResponse("Forbidden", { status: 403 });

        const { email } = await req.json();
        if (!email)
            return new NextResponse("Email is required", { status: 400 });

        const existingSubscriber = await db.newsletter.findUnique({
            where: {
                email_organizationId: {
                    email,
                    organizationId: orgId,
                },
            },
        });

        if (existingSubscriber) {
            if (existingSubscriber.active) {
                return new NextResponse("Subscriber already exists", { status: 409 });
            } else {
                await db.newsletter.update({
                    where: {
                        email_organizationId: {
                            email,
                            organizationId: orgId,
                        },
                    },
                    data: { active: true },
                });
                return NextResponse.json({ message: "Subscriber reactivated." }, { status: 200 });
            }
        } else {
            const createdSubscriber = await db.newsletter.create({
                data: {
                    email,
                    organizationId: orgId,
                },
                include: {
                    organization: true,
                },
            });

            await sendWelcomeEmail({
                to: email,
                organizationName: createdSubscriber.organization.name,
            });

            return NextResponse.json({ message: "Subscriber added successfully." }, { status: 201 });
        }
    } catch (error) {
        console.error("[NEWSLETTER_POST_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
