import { db } from "@/lib/db";
import { sendNewsletterEmail } from "@/lib/email";
import { subDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    // 1. Secure the endpoint
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const sevenDaysAgo = subDays(new Date(), 7);
        const organizations = await db.organization.findMany();

        for (const org of organizations) {
            const newPosts = await db.post.findMany({
                where: {
                    organizationId: org.id,
                    published: true,
                    publishedAt: { gte: sevenDaysAgo },
                },
                select: { title: true, slug: true, excerpt: true }
            });

            if (newPosts.length === 0) {
                console.log(`No new posts for ${org.name}, skipping newsletter.`);
                continue;
            }

            const subscribers = await db.newsletter.findMany({
                where: { organizationId: org.id, active: true },
            });

            if (subscribers.length === 0) {
                console.log(`No subscribers for ${org.name}, skipping.`);
                continue;
            }

            // Send emails to all subscribers for this org
            const emailPromises = subscribers.map(sub => 
                sendNewsletterEmail({
                    to: sub.email,
                    subject: `New Posts from ${org.name}`,
                    organizationName: org.name,
                    posts: newPosts,
                })
            );
            await Promise.allSettled(emailPromises);
             console.log(`Sent ${subscribers.length} newsletters for ${org.name}.`);
        }
        
        return NextResponse.json({ success: true, message: "Newsletter job completed." });

    } catch (error) {
        console.error("[CRON_NEWSLETTER]", error);
        return new NextResponse("Internal Cron Error", { status: 500 });
    }
}