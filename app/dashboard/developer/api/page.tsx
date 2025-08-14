// /app/dashboard/developer/api/page.tsx (NEW FILE)
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { ApiKeysSettings } from "@/components/dashboard/api-keys-settings"; // The new component

export default async function DeveloperApiPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });
  
  const orgId = user?.organizationId;
  if (!orgId) notFound();

  // Fetch all API keys for this organization
  const apiKeys = await db.apiKey.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Developer Settings & API Keys"
        text="Manage API keys to access your content programmatically."
      />
      <ApiKeysSettings organizationId={orgId} apiKeys={apiKeys} />
    </DashboardShell>
  );
}