"use client"

import Link from "next/link"
import { Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react"

import { useSiteConfig } from "@/components/providers/site-config-provider"

export function SiteFooter() {
  const { siteConfig, loading } = useSiteConfig()

  const footerNavigation = {
    main: [
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
      { name: "Categories", href: "/categories" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  }

  const socialLinks = siteConfig?.social_links || {}

  return (
    <footer className="bg-background border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {siteConfig?.logo_url ? (
                <img
                  src={siteConfig.logo_url || "/placeholder.svg"}
                  alt={siteConfig.site_name || "InkPress"}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-xl font-bold">{siteConfig?.site_name || "InkPress"}</span>
              )}
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {siteConfig?.site_description ||
                "A modern blogging and publishing platform for creators, editors, and affiliate-driven blogs."}
            </p>
            <div className="flex space-x-4">
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              )}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-2">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Navigation</h3>
              <ul className="space-y-2">
                {footerNavigation.main.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2">
                {footerNavigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-sm text-muted-foreground">
            {siteConfig?.footer_text || `© ${new Date().getFullYear()} InkPress. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
