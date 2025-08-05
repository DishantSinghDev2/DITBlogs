import type { MetadataRoute } from "next"
import { db } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  // Get all published posts
  const posts = await db.post.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Get all categories
  const categories = await db.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Get all tags
  const tags = await db.tag.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]

  // Post routes
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Category routes
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/blog?category=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Tag routes
  const tagRoutes = tags.map((tag) => ({
    url: `${baseUrl}/blog?tag=${tag.slug}`,
    lastModified: tag.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [...routes, ...postRoutes, ...categoryRoutes, ...tagRoutes]
}
