import { db } from "@/lib/db"
import { cache } from "react"

export const getPopularTags = cache(async (limit = 20) => {
  const tags = await db.tag.findMany({
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
      posts: {
        _count: "desc",
      },
    },
    take: limit,
  })

  return tags
})

export const getTagBySlug = cache(async (slug: string) => {
  const tag = await db.tag.findUnique({
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
    },
  })

  return tag
})
