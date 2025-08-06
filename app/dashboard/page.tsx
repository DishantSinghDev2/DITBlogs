import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db"; // Import your Prisma Client

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentPosts } from "@/components/dashboard/recent-posts";
import { DraftPosts } from "@/components/dashboard/draft-posts";
import { getUserStats, getRecentPosts, getDraftPosts } from "@/lib/api/dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // --- FIX: Get the user's organization context ---
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      organizationId: true,
      ownedOrganization: { select: { id: true } },
    },
  });
  
  const orgId = user?.ownedOrganization?.id || user?.organizationId;

  // If user has no organization context, they can't see a dashboard.
  if (!orgId) {
    // This state can happen if a writer is pending approval.
    redirect("/onboarding?status=pending");
  }

  // --- FIX: Pass the organizationId to your data-fetching functions ---
  const [stats, recentPosts, draftPosts] = await Promise.all([
    getUserStats(orgId),
    getRecentPosts(orgId),
    getDraftPosts(orgId),
  ]);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Welcome back! Here's an overview of your activity."
      />
      <div className="grid gap-6">
        <DashboardStats stats={stats} />
        <div className="grid gap-6 md:grid-cols-2">
          <RecentPosts posts={recentPosts} />
          <DraftPosts posts={draftPosts} />
        </div>
      </div>
    </DashboardShell>
  );
}