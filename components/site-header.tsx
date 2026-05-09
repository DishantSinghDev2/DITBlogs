"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Menu, X, Sun, Moon, Loader2, Crown, LogOut, User,
  Star, Settings, FileText, LayoutDashboard, Building2,
  Check, ChevronRight, PlusCircle,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
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
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const organizations = session?.user?.organizations ?? []
  const activeOrgId = session?.user?.organizationId
  const activeOrg = organizations.find((o) => o.id === activeOrgId)

  async function handleSwitchOrg(orgId: string) {
    if (orgId === activeOrgId || isSwitching) return
    setIsSwitching(true)

    try {
      const res = await fetch("/api/user/switch-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      })

      if (!res.ok) throw new Error("Switch failed")

      await update()
      router.refresh()
      toast({ title: "Organization switched" })
    } catch {
      toast({ title: "Failed to switch organization", variant: "destructive" })
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <header
      className={`sticky top-0 px-4 z-50 w-full border-b ${
        isScrolled ? "bg-background/80 backdrop-blur-sm" : "bg-background"
      } transition-all duration-200`}
    >
      <div className="flex h-16 items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logotext.png" alt="DITBlogs" className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
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

              <DropdownMenuContent className="w-64" align="end" forceMount>
                {/* User info */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    {activeOrg && (
                      <div className="flex items-center gap-1 pt-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {activeOrg.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1 ml-auto">
                          {activeOrg.role?.replace("_", " ")}
                        </Badge>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Navigation links */}
                {session.user.organizationId ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/posts">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>My Content</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings/profile">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding">
                      <Star className="mr-2 h-4 w-4" />
                      <span>Get Started</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {session.user.role === "ORG_ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/members">
                      <User className="mr-2 h-4 w-4" />
                      <span>Manage Members</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Organization switcher */}
                {organizations.length > 0 && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>Switch Organization</span>
                        {isSwitching && <Loader2 className="ml-auto h-3 w-3 animate-spin" />}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-52">
                        {organizations.map((org) => (
                          <DropdownMenuItem
                            key={org.id}
                            onClick={() => handleSwitchOrg(org.id)}
                            className="cursor-pointer"
                            disabled={isSwitching}
                          >
                            <Building2 className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate flex-1">{org.name}</span>
                            {org.id === activeOrgId && (
                              <Check className="ml-2 h-4 w-4 text-primary shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/onboarding">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Join another org</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Upgrade prompt */}
                {session.user.plan === "FREE" && (
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

                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get started</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
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

      {/* Mobile menu */}
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
                    className={`text-xl font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              {!session && (
                <div className="flex flex-col gap-3">
                  <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/auth/register">Get started</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
