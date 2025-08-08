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
        data: {
            ...body,
            tags: {
                set: [], // optional: clear old ones
                connectOrCreate: (body.tags || []).map((tag) => ({
                    where: {
                        // Unique constraint: slug + org
                        organizationId_slug: {
                            slug: tag,
                            organizationId: body.organizationId,
                        },
                    },
                    create: {
                        slug: tag,
                        name: tag, // or use a formatted name
                        organization: { connect: { id: body.organizationId } },
                    },
                })),
            },
        }
    });
    return NextResponse.json(updatedDraft);
}

export async function DELETE(req: Request, { params }: { params: { draftId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });


    const { draftId } = params;

    const canEdit = await canUserPerformAction(session.user.id, "draft:edit", draftId);
    if (!canEdit) return new NextResponse("Forbidden", { status: 403 });

    // You can add permission checks here if needed
    await db.draft.delete({
        where: { id: draftId, authorId: session.user.id },
    });
    return NextResponse.json({ message: "Draft deleted successfully" });
}