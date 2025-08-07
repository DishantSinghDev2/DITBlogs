import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { PlanUsageDashboard } from "@/components/dashboard/plan-usage-dashboard";
import { getUserRoleInOrg } from "@/lib/api/user";

export default async function PlanSettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/login");

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true }});
    const orgId = user?.organizationId;
    if (!orgId) redirect("/onboarding");

    const userRole = await getUserRoleInOrg(session.user.id, orgId);
    if (userRole !== "ORG_ADMIN") redirect("/dashboard");

    const organization = await db.organization.findUnique({
        where: { id: orgId },
        include: { _count: { select: { members: true, posts: true } } }
    });

    if (!organization) redirect("/dashboard");

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Plan & Usage"
                text="View your current plan, monitor usage, and explore upgrade options."
            />
            <PlanUsageDashboard organization={organization} />
        </DashboardShell>
    );
}