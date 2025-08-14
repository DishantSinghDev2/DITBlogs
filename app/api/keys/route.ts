// /app/api/keys/route.ts (NEW FILE)
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { canUserPerformAction } from "@/lib/api/user";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

const keySchema = z.object({
  name: z.string().min(2, "Key name must be at least 2 characters."),
  orgId: z.string(),
});

// POST to create a new API key
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const validated = keySchema.safeParse(body);
    if (!validated.success) return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    
    const { name, orgId } = validated.data;
    const canCreate = await canUserPerformAction(session.user.id, "org:edit_settings", orgId);
    if (!canCreate) return new NextResponse("Forbidden", { status: 403 });

    const newKey = await db.apiKey.create({
        data: {
            name,
            key: `ditb_${nanoid(32)}`, // Generate a new key with a prefix
            organizationId: orgId,
        },
    });

    return NextResponse.json(newKey);
}