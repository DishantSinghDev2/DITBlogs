import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { getUserRoleInOrg } from "@/lib/api/user";
import { getOrganizationAnalytics } from "@/lib/api/analytics"; // Renamed for clarity

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 1. Get the user's organization context
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  const orgId = user?.organizationId;
  if (!orgId) {
    redirect("/onboarding");
  }

  // 2. Check if user is an ORG_ADMIN for their organization
  const userRole = await getUserRoleInOrg(session.user.id, orgId);
  if (userRole !== "ORG_ADMIN") {
    redirect("/dashboard");
  }

  // 3. Fetch analytics data specifically for the current organization
  const analyticsData = await getOrganizationAnalytics(orgId);

  return (
    <div className="space-y-4">
      <DashboardHeader
      heading="Organization Analytics"
      text="An overview of your organization's content and engagement." />
      <AnalyticsDashboard data={analyticsData} />
      </div>
  );
}