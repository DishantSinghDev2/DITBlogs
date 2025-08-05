import { db } from "@/lib/db"
import { cache } from "react"

export const getAllAffiliateLinks = cache(async (userId?: string) => {
  const query: any = {}

  if (userId) {
    query.userId = userId
  }

  const affiliateLinks = await db.affiliateLink.findMany({
    where: query,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return affiliateLinks
})

export const getAffiliateLinkById = cache(async (id: string) => {
  const affiliateLink = await db.affiliateLink.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return affiliateLink
})

export const getAffiliateLinkStats = cache(async (userId?: string) => {
  const query: any = {}

  if (userId) {
    query.userId = userId
  }

  const totalLinks = await db.affiliateLink.count({
    where: query,
  })

  const totalClicks = await db.affiliateLinkClick.count({
    where: {
      affiliateLink: query,
    },
  })

  const totalConversions = await db.affiliateLinkConversion.count({
    where: {
      affiliateLink: query,
    },
  })

  return {
    totalLinks,
    totalClicks,
    totalConversions,
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
  }
})
