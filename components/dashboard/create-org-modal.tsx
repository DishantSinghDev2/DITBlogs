"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  open: boolean
  // When onClose is provided the modal is closeable (user-triggered).
  // When absent it's blocking — user has no org and must create one.
  onClose?: () => void
}

export function CreateOrgModal({ open, onClose }: Props) {
  const router = useRouter()
  const { update } = useSession()
  const [orgName, setOrgName] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)

  const blocking = !onClose

  function handleOpenChange(v: boolean) {
    if (!v && onClose) onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgName.trim() || !website.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName: orgName.trim(), website: website.trim() }),
      })
      if (!res.ok) {
        toast.error((await res.text()) || "Failed to create organization")
        return
      }
      setOrgName("")
      setWebsite("")
      onClose?.()
      await update()
      router.refresh()
      toast.success("Organization created!")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={blocking ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={blocking ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {blocking ? "Create your organization" : "Create a new organization"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {blocking
              ? "Set up a workspace to start publishing blogs."
              : "Each organization has its own posts, members, and settings."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="co-orgName">Organization name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="co-orgName"
                placeholder="Acme Corp"
                className="pl-9"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="co-website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="co-website"
                placeholder="https://acme.com"
                className="pl-9"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
            ) : (
              "Create organization"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
