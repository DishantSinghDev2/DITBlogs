import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@/components/analytics"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteConfigProvider } from "@/components/providers/site-config-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import "./index.scss"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "InkPress - Modern Blogging Platform",
    template: "%s | InkPress",
  },
  description: "A modern blogging and publishing platform built with Next.js",
  keywords: ["blog", "publishing", "writing", "content management", "nextjs"],
  authors: [
    {
      name: "InkPress Team",
    },
  ],
  creator: "InkPress Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXTAUTH_URL || "https://inkpress.vercel.app",
    title: "InkPress - Modern Blogging Platform",
    description: "A modern blogging and publishing platform built with Next.js",
    siteName: "InkPress",
  },
  twitter: {
    card: "summary_large_image",
    title: "InkPress - Modern Blogging Platform",
    description: "A modern blogging and publishing platform built with Next.js",
    creator: "@inkpress",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteConfigProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col container mx-auto px-4">
                <SiteHeader />
                <Suspense>
                  <div className="">{children}</div>
                </Suspense>
                <SiteFooter />
              </div>
              <Analytics />
              <Toaster />
            </AuthProvider>
          </SiteConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
