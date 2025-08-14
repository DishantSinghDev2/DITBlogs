// /app/api/keys/[id]/route.ts (NEW FILE)
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { canUserPerformAction } from "@/lib/api/user";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// DELETE to revoke an API key
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const keyData = await db.apiKey.findUnique({ where: { id: params.id } });
    if (!keyData) return new NextResponse("Key not found", { status: 404 });

    const canDelete = await canUserPerformAction(session.user.id, "org:edit_settings", keyData.organizationId);
    if (!canDelete) return new NextResponse("Forbidden", { status: 403 });

    // Invalidate the cache for this key BEFORE deleting from DB
    await redis.del(`v1:auth:key:${keyData.key}`);

    await db.apiKey.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
}