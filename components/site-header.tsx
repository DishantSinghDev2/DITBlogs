"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { redirect, usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Menu, X, Search, Sun, Moon, Loader2, Crown, LogOut, User, Star, Settings, FileText, LayoutDashboard } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

export function SiteHeader() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
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
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
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
      className={`top-0 px-4 z-50 w-full border-b ${isScrolled ? "bg-background/80 backdrop-blur-sm " : "bg-background"
        } transition-all duration-200`}
    >
      <div className=" flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src={"/logotext.png"}
              alt={"DITBlogs"}
              className="h-8 w-auto"
            />
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

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {/* --- CUTE & ADVANCED DROPDOWN --- */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* --- Dynamic links based on user's organization status --- */}
                {session.user.organizationId ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/posts"><FileText className="mr-2 h-4 w-4" /><span>My Content</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings/profile"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding"><Star className="mr-2 h-4 w-4" /><span>Get Started</span></Link>
                  </DropdownMenuItem>
                )}

                {/* --- Admin Link (only for ORG_ADMIN) --- */}
                {session.user.role === 'ORG_ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/members"><User className="mr-2 h-4 w-4" /><span>Manage Members</span></Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* --- Upgrade Button (only for FREE plan users) --- */}
                {session.user.plan === 'FREE' && (
                  <>
                    <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
                      <Link href="/dashboard/settings/plan">
                        <Crown className="mr-2 h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            className="md:hidden fixed top-0 left-0 z-[70] w-full h-full bg-background/95 flex items-center justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
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
      </AnimatePresence>
    </header>
  )
}
