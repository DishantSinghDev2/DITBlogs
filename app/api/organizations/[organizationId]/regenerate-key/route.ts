import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";
import { cuid } from '@prisma/client/runtime/library';

// Handler to regenerate an API key
export async function POST(req: Request, { params }: { params: { organizationId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
        
        const { organizationId } = params;
        const canEdit = await canUserPerformAction(session.user.id, "org:edit_settings", organizationId);
        if (!canEdit) return new NextResponse("Forbidden", { status: 403 });
        
        const updatedOrg = await db.organization.update({
            where: { id: organizationId },
            data: { apiKey: cuid() }, // Generate a new CUID for the API key
        });
        
        return NextResponse.json({ apiKey: updatedOrg.apiKey });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}