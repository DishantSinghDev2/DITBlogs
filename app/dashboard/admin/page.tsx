import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell-child"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { checkUserRole } from "@/lib/api/user"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const isAdmin = await checkUserRole(session.user.id, "admin")

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Manage your site settings and content." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your site settings and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Update your site name, logo, and other general settings.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/settings" passHref>
              <Button variant="outline" className="w-full">
                Manage Settings
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize your site's look and feel.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Change colors, typography, and layout options.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/appearance" passHref>
              <Button variant="outline" className="w-full">
                Customize Appearance
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View, edit, and delete user accounts.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/users" passHref>
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View detailed site analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Track user engagement, page views, and more.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/analytics" passHref>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>Optimize your site for search engines.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure meta tags, sitemaps, and other SEO settings.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/seo" passHref>
              <Button variant="outline" className="w-full">
                Manage SEO
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Links</CardTitle>
            <CardDescription>Manage your affiliate links.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Add, edit, and track performance of affiliate links.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/affiliate-links" passHref>
              <Button variant="outline" className="w-full">
                Manage Affiliate Links
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}
