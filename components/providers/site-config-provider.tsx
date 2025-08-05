"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface SiteConfig {
  siteName: string
  siteDescription: string
  siteUrl: string
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  googleAnalyticsId: string
  metaPixelId: string
  adsenseId: string
  defaultLanguage: string
  enableComments: boolean
  enableNewsletter: boolean
  enableDarkMode: boolean
  [key: string]: any
}

interface SiteConfigContextType {
  siteConfig: SiteConfig | null
  loading: boolean
}

const defaultConfig: SiteConfig = {
  siteName: "InkPress",
  siteDescription: "A modern blogging and publishing platform",
  siteUrl: typeof window !== "undefined" ? window.location.origin : "https://inkpress.vercel.app",
  logoUrl: "/logo.svg",
  faviconUrl: "/favicon.ico",
  primaryColor: "#3b82f6",
  secondaryColor: "#10b981",
  accentColor: "#8b5cf6",
  googleAnalyticsId: "",
  metaPixelId: "",
  adsenseId: "",
  defaultLanguage: "en",
  enableComments: true,
  enableNewsletter: true,
  enableDarkMode: true,
  social_links: {},
  footer_text: `© ${new Date().getFullYear()} InkPress. All rights reserved.`,
  site_name: "InkPress",
  site_description: "A modern blogging and publishing platform",
  logo_url: "/logo.svg",
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  siteConfig: defaultConfig,
  loading: true,
})

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        // Try to get from localStorage first for faster initial load
        if (typeof window !== "undefined") {
          const cachedConfig = localStorage.getItem("site_config")
          if (cachedConfig) {
            setConfig(JSON.parse(cachedConfig))
          }
        }

        // Fetch the latest config
        const response = await fetch("/api/admin/settings")
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
          if (typeof window !== "undefined") {
            localStorage.setItem("site_config", JSON.stringify(data))
          }
        }
      } catch (error) {
        console.error("Error fetching site config:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return <SiteConfigContext.Provider value={{ siteConfig: config, loading }}>{children}</SiteConfigContext.Provider>
}
