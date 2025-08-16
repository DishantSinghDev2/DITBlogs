import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
// Step 1: Import NextTopLoader
import NextTopLoader from 'nextjs-toploader';

import { Analytics } from "@/components/analytics"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import "./index.scss"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // --- General Metadata ---
  title: {
    default: "DITBlogs - The Effortless Blogging Platform for Your Business",
    template: "%s | DITBlogs",
  },
  description: "Power your website with a seamless, feature-rich blog. DITBlogs provides the headless backend, a powerful editor, and full organization management.",
  
  // --- SEO Keywords ---
  keywords: [
    "headless blog",
    "headless cms",
    "saas blogging",
    "blog for business",
    "organization blog",
    "content management",
    "next.js blog",
    "react blog",
    "team collaboration",
    "content marketing",
  ],
  
  // --- Author and Creator ---
  authors: [
    {
      name: "DishIs Technologies",
      url: "https://dishis.tech",
    },
  ],
  creator: "DishIs Technologies",

  // --- Open Graph (for social sharing on platforms like Facebook, LinkedIn) ---
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXTAUTH_URL || "https://blogs.dishis.tech",
    title: "DITBlogs: The Effortless Blogging Platform for Your Business",
    description: "Power your website with a seamless, feature-rich blog, including a powerful editor and organization management.",
    siteName: "DITBlogs",
    images: [
      {
        url: `${process.env.NEXTAUTH_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'DITBlogs - The Effortless Blogging Platform for Your Business',
      },
    ],
  },

  // --- Twitter Card (for sharing on Twitter) ---
  twitter: {
    card: "summary_large_image",
    title: "DITBlogs: Effortless Blogging for Your Business",
    description: "Power your website with a seamless, feature-rich blog, including a powerful editor and organization management.",
    images: [`${process.env.NEXTAUTH_URL}/og-image.png`],
  },

  // --- Icons and Manifest ---
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
            <AuthProvider>
              {/* Step 2: Place NextTopLoader here, right inside the providers */}
              <NextTopLoader
                color="#2299DD"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={true}
                easing="ease"
                speed={200}
                shadow="0 0 10px #2299DD,0 0 5px #2299DD"
              />
              <div className="relative flex min-h-screen flex-col max-w-[100vw] mx-auto">
                <SiteHeader />
                {/* Step 3: Remove the <Suspense> wrapper, it's not needed for this loader */}
                <main className="flex-1 w-full mx-auto">{children}</main>
                <SiteFooter />
              </div>
              <Analytics />
              <Toaster />
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}