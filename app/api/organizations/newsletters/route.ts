import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const admin = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
        const orgId = admin?.organizationId;
        if (!orgId) return new NextResponse("Admin not in an organization", { status: 403 });
        
        const canManage = await canUserPerformAction(session.user.id, "org:edit_settings", orgId); // Re-use a relevant permission
        if (!canManage) return new NextResponse("Forbidden", { status: 403 });

        const { email } = await req.json();
        if (!email) return new NextResponse("Email is required", { status: 400 });

        const existingSubscriber = await db.newsletter.findUnique({ where: { email } });

        if (existingSubscriber) {
            // Can't add someone who is already subscribed to another org
            if (existingSubscriber.organizationId !== orgId) {
                return new NextResponse("This email is already subscribed to another organization's newsletter.", { status: 409 });
            }
            // If they are in the same org but inactive, reactivate
            await db.newsletter.update({ where: { email }, data: { active: true } });
        } else {
            // Create new subscriber for this organization
            await db.newsletter.create({ data: { email, organizationId: orgId } });
        }
        
        return NextResponse.json({ message: "Subscriber added successfully." }, { status: 201 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}