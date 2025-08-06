import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { canUserPerformAction } from "@/lib/api/user";
import * as z from "zod";

const orgUpdateSchema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("")),
});

// Handler to update organization details
export async function PATCH(req: Request, { params }: { params: { organizationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { organizationId } = params;
    const canEdit = await canUserPerformAction(session.user.id, "org:edit_settings", organizationId);
    if (!canEdit) return new NextResponse("Forbidden", { status: 403 });

    const body = await req.json();
    const { name, website } = orgUpdateSchema.parse(body);

    const updatedOrg = await db.organization.update({
      where: { id: organizationId },
      data: { name, website },
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
     if (error instanceof z.ZodError) return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Handler to delete an organization
export async function DELETE(req: Request, { params }: { params: { organizationId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { organizationId } = params;
        const canDelete = await canUserPerformAction(session.user.id, "org:edit_settings", organizationId); // Use same perm for now
        if (!canDelete) return new NextResponse("Forbidden", { status: 403 });

        // This is a destructive action and will cascade delete all posts, members, etc.
        await db.organization.delete({
            where: { id: organizationId },
        });

        return new NextResponse("Organization Deleted");
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}