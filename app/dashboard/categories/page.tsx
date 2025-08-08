import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child";
import { CategoriesDashboard } from "@/components/dashboard/categories-dashboard";
import { canUserPerformAction } from "@/lib/api/user";

async function getCategories(organizationId: string) {
    return db.category.findMany({
        where: { organizationId },
        include: { _count: { select: { posts: true } } },
        orderBy: { name: 'asc' },
    });
}

export default async function CategoriesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/login");

    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { organizationId: true } });
    const orgId = user?.organizationId;
    if (!orgId) redirect("/onboarding");

    const canManage = await canUserPerformAction(session.user.id, "org:manage_categories", orgId);
    if (!canManage) redirect("/dashboard");

    const categories = await getCategories(orgId);

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Categories"
                text="Create and manage your content categories."
            />
            <CategoriesDashboard initialCategories={categories} />
        </DashboardShell>
    );
}