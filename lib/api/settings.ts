import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { cache } from "react"

export const getSettings = cache(async () => {
  // Check cache
  const cachedSettings = await redis.get("site_settings")
  if (cachedSettings) {
    return typeof cachedSettings === 'string' ? JSON.parse(cachedSettings) : cachedSettings
  }

  // Get all settings
  const settings = await db.siteConfig.findMany()

  // Transform to key-value object
  const settingsObject = settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, any>,
  )

  // Cache settings
  await redis.set("site_settings", JSON.stringify(settingsObject), {
    ex: 60 * 60, // 1 hour
  })

  return settingsObject
})

export const updateSettings = async (settings: Record<string, any>) => {
  // Update each setting
  for (const [key, value] of Object.entries(settings)) {
    await db.siteConfig.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
      },
    })
  }

  // Clear cache
  await redis.del("site_settings")

  return true
}


// function getSEOSettings 
export const getSEOSettings = cache(async () => {
  // Check cache
  const cachedSettings = await redis.get("site_seo_settings")
  if (cachedSettings) {
    return JSON.parse(cachedSettings as string)
  }

  // Get SEO settings
  const settings = await db.seo.findFirst()

  // Cache settings
  await redis.set("site_seo_settings", JSON.stringify(settings), {
    ex: 60 * 60, // 1 hour
  })

  return settings
}
)