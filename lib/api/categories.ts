import { db } from "@/lib/db"
import { cache } from "react"

export const getAllCategories = cache(async (page = 1, limit = 10) => {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              published: true,
            },
          },
        },
      },

    },
    orderBy: {
      name: "asc",
    },
    skip: (page - 1) * limit,
    take: limit,
  })

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    postCount: category._count.posts,
  }))
})

export const getCategoryBySlug = cache(async (slug: string, page = 1, limit = 10) => {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: {
            where: {
              published: true,
            },
          },
        },
      },
      posts: {
        where: {
          published: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          publishedAt: true,
          readingTime: true,
          categoryId: true, // Add categoryId to the selection
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              views: true,
              comments: true,
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      },
    },
  })

  return { ...category, posts: category?.posts.map(post => ({ ...post, viewCount: post._count.views, commentCount: post._count.comments })) || [] }
})
