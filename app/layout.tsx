import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@/components/analytics"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import "./index.scss"
import { Suspense } from "react"

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
    url: process.env.NEXTAUTH_URL || "https://blogs.dishis.tech", // Use your production URL
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
    // Optional: Add your Twitter handle
    // creator: "@yourTwitterHandle", 
    // Optional: Add the same OG image here
    images: [`${process.env.NEXTAUTH_URL}/og-image.png`],
  },

  // --- Icons and Manifest ---
  // (These paths point to files in your /public directory. No changes needed unless filenames are different)
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
              <div className="relative flex min-h-screen flex-col max-w-[100vw] mx-auto">
                <SiteHeader />
                <Suspense>
                  <div className="">{children}</div>
                </Suspense>
              </div>
              <Analytics />
              <Toaster />
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
