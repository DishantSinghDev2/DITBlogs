import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";

export async function PUT(req: Request, { params }: { params: { draftId: string } }) {
        const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    
    
    const { draftId } = params;
    const body = await req.json();
    
    const canEdit = await canUserPerformAction(session.user.id, "draft:edit", draftId);
    if (!canEdit) return new NextResponse("Forbidden", { status: 403 });

    // You can add permission checks here if needed
    const updatedDraft = await db.draft.update({
        where: { id: draftId, authorId: session.user.id }, // Ensure user owns the draft
        data: body,
    });
    return NextResponse.json(updatedDraft);
}