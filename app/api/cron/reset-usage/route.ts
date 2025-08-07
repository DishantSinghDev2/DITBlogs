import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await db.organization.updateMany({
            data: {
                monthlyPostViews: 0,
                limitWarningSentAt: null, // Also reset the warning flag
            },
        });
        return NextResponse.json({ success: true, message: "Monthly usage reset successfully." });
    } catch (error) {
        return new NextResponse("Internal Cron Error", { status: 500 });
    }
}