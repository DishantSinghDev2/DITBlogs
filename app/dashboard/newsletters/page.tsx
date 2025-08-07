import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { NewsletterDashboard } from "@/components/dashboard/newsletter-dashboard";
import { getUserRoleInOrg } from "@/lib/api/user";

// A simple data-fetching function for the page
async function getSubscribers(organizationId: string) {
    const subscribers = await db.newsletter.findMany({
        where: { organizationId, active: true },
        orderBy: { createdAt: 'desc' },
    });
    return subscribers;
}

export default async function NewslettersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/login");

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
    const orgId = user?.organizationId;
    if (!orgId) redirect("/onboarding");
    
    const userRole = await getUserRoleInOrg(session.user.id, orgId);
    if (userRole !== "ORG_ADMIN") redirect("/dashboard");

    const subscribers = await getSubscribers(orgId);

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Newsletter Subscribers"
                text="View and manage your organization's newsletter list."
            />
            <NewsletterDashboard initialSubscribers={subscribers} />
        </DashboardShell>
    );
}