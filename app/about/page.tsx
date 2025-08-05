import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageContent } from "@/components/page-content"
import { getPageBySlug } from "@/lib/api/pages"
import { getSiteConfig } from "@/lib/api/settings"

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig()
  const page = await getPageBySlug("about")

  if (!page) {
    return {
      title: `About | ${siteConfig.name}`,
    }
  }

  return {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.excerpt || `About ${siteConfig.name}`,
  }
}

export default async function AboutPage() {
  const page = await getPageBySlug("about")
  const siteConfig = await getSiteConfig()

  if (!page) {
    notFound()
  }

  return (
    <div className="container py-8">
      <PageContent content={page.content} />
    </div>
  )
}
