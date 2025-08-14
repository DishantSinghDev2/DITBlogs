// /home/dit/blogs/DITBlogs/app/dashboard/settings/organization/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { OrganizationSettings } from "@/components/dashboard/organization-settings";
import { canUserPerformAction } from "@/lib/api/user";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";

export default async function OrgSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  
  const orgId = user?.organizationId;
  if (!orgId) {
    return notFound();
  }

  const canEditSettings = await canUserPerformAction(session.user.id, "org:edit_settings", orgId);
  if (!canEditSettings) {
    redirect("/dashboard");
  }

  const organization = await db.organization.findUnique({
    where: { id: orgId },
  });

  if (!organization) {
    return notFound();
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Organization Settings"
        text="Manage your organization's details, API access, and more."
      />
      <OrganizationSettings organization={organization} />
    </DashboardShell>
  );
}