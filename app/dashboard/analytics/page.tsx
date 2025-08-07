import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { getUserRoleInOrg } from "@/lib/api/user";
import { getOrganizationAnalytics } from "@/lib/api/analytics";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: { from?: string; to?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  // 1. Get the user's organization context
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  const orgId = user?.organizationId;
  if (!orgId) {
    redirect("/onboarding");
  }
  if (!orgId) redirect("/onboarding");

  const userRole = await getUserRoleInOrg(session.user.id, orgId);
  if (userRole !== "ORG_ADMIN") redirect("/dashboard");

  // FIX: Parse dates from search params
  const from = searchParams?.from ? new Date(searchParams.from) : undefined;
  const to = searchParams?.to ? new Date(searchParams.to) : undefined;

  const analyticsData = await getOrganizationAnalytics(orgId, from, to);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Organization Analytics"
        text="An overview of your organization's content and engagement." />
      <AnalyticsDashboard data={analyticsData} initialDateRange={{ from, to }} />
    </DashboardShell>
  );
}