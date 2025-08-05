import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageContent } from "@/components/page-content"
import { PageHeader } from "@/components/page-header"
import { getPageBySlug } from "@/lib/api/pages"
import { getSiteConfig } from "@/lib/api/settings"

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  const page = await getPageBySlug("privacy-policy")

  if (!page) {
    return {
      title: `Privacy Policy | ${siteConfig.name}`,
    }
  }

  return {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.excerpt || `Privacy Policy for ${siteConfig.name}`,
  }
}

export default async function PrivacyPolicyPage() {
  const page = await getPageBySlug("privacy-policy")
  const siteConfig = await getSiteConfig()

  if (!page) {
    notFound()
  }

  return (
    <div className="container py-8">
      <PageHeader heading={page.title} text={page.excerpt || ""} />
      <PageContent content={page.content} />
    </div>
  )
}
