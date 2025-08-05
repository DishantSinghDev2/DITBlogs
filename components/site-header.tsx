"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { redirect, usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Menu, X, Search, Sun, Moon, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSiteConfig } from "@/components/providers/site-config-provider"
import { useTheme } from "next-themes"

export function SiteHeader() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const { siteConfig, loading } = useSiteConfig()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
  ]

  const userInitials = session?.user?.name
    ? session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U"

  const handleBlogSearch = () => {
    if (searchQuery) {
      // Redirect to the blog search page with the query
      redirect(`/blog?search=${searchQuery}`)
    } else {
      return
    }
  }

  const handleSearchKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') {
      handleBlogSearch();
    }
  };

  return (
    <header
      className={`sticky top-0 z-[60] w-full ${isScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-background"
        } transition-all duration-200`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            {siteConfig?.logo_url ? (
              <img
                src={"/placeholder.svg"}
                alt={"DITBlogs"}
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-xl font-bold">DITBlogs</span>
            )}
          </Link>

          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {session.user.role !== "user" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/posts">My Posts</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/bookmarks">Bookmarks</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">Settings</Link>
                    </DropdownMenuItem>

                  </>)}
                {session.user.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="#" onClick={() => signOut()}>Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
          className={`md:hidden ${isMobileMenuOpen ? "z-[100]" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu with Framer Motion */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden fixed top-0 left-0 z-50 w-full h-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6 text-center">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-xl font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}

      {/* Search Bar Animation */}
      {isSearchOpen && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center  w-full h-full bg-background/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-full md:w-96">
            <Input placeholder="Search..." className="w-full rounded-full border-none bg-secondary text-secondary-foreground shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ paddingLeft: '3rem' }} // Add padding for the icon
              value={searchQuery}              
              
              autoFocus
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setIsSearchOpen(false)}
              onKeyDown={handleSearchKeyDown}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>

            </Button>
          </div>
        </motion.div>
      )}
    </header>
  )
}
