import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentPosts } from "@/components/dashboard/recent-posts";
import { DraftPosts } from "@/components/dashboard/draft-posts";
import { getUserStats, getRecentPosts, getDraftPosts } from "@/lib/api/dashboard";
import { InvitationDashboard } from "@/components/dashboard/invitation-dashboard";
import { PendingDashboard } from "@/components/dashboard/pending-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // 1. Fetch a comprehensive user status in one query
  const userStatus = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      organizationId: true,
      // Get the first pending invitation
      invites: {
        where: { status: 'PENDING' },
        take: 1,
        include: { organization: { select: { name: true } } },
      },
      // Get the first pending or rejected membership request
      membershipRequest: {
        where: { status: { in: ['PENDING', 'REJECTED'] } },
        take: 1,
        include: { organization: { select: { name: true } } },
      },
    },
  });

  if (!userStatus) {
    // This should not happen for an authenticated user
    redirect("/auth/login");
  }

  // --- Logic to determine which view to show ---

  // Priority 1: User is an active member of an organization ("Happy Path")
  if (userStatus.organizationId) {
    const [stats, recentPosts, draftPosts] = await Promise.all([
      getUserStats(userStatus.organizationId),
      getRecentPosts(userStatus.organizationId),
      getDraftPosts(userStatus.organizationId),
    ]);

    return (
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text="Welcome back! Here's an overview of your activity." />
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

  // Priority 2: User has a pending invitation
  const pendingInvite = userStatus.invites[0];
  if (pendingInvite) {
    return (
      <DashboardShell>
        <InvitationDashboard invite={pendingInvite} />
      </DashboardShell>
    );
  }

  // Priority 3: User has a pending or rejected request
  const membershipRequest = userStatus.membershipRequest[0];
  if (membershipRequest) {
    // The middleware will handle redirecting REJECTED users to /rejected.
    // This part handles the PENDING state.
    if (membershipRequest.status === 'PENDING') {
      return (
        <DashboardShell>
          <PendingDashboard request={membershipRequest} />
        </DashboardShell>
      );
    }
  }

  // Fallback: If none of the above, user needs to start onboarding
  redirect("/onboarding");
}