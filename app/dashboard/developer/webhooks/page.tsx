import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { WebhookSettings } from "@/components/dashboard/webhook-settings";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

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

    const organization = await db.organization.findUnique({
        where: { id: orgId },
    });

    if (!organization) {
        return notFound();
    }

    // Fetch the webhooks for the organization
    const webhooks = await db.webhook.findMany({
        where: { organizationId: orgId },
    });

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Organization Settings"
                text="Manage your organization's details and API access."
            />
            <div className="space-y-8">

                {/* Add the Webhook Settings section */}
                <div className="border-t pt-8">
                    <h2 className="text-xl font-semibold mb-4">Webhook Configuration</h2>
                    <p className="text-muted-foreground mb-6">Configure endpoints to receive real-time notifications when your content changes.</p>
                    <WebhookSettings organizationId={organization.id} webhooks={webhooks} />
                </div>
            </div>
        </DashboardShell>
    );
}
