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

export function CreateOrgModal({ open }: { open: boolean }) {
  const router = useRouter()
  const { update } = useSession()
  const [orgName, setOrgName] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)

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
        toast.error(await res.text() || "Failed to create organization")
        return
      }
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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Create your organization</DialogTitle>
          <DialogDescription className="text-center">
            Set up a workspace to start publishing blogs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="orgName"
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
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="website"
                placeholder="https://acme.com"
                className="pl-9"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : "Create organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
