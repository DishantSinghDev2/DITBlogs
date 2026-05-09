"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

interface Invite {
  id: string
  email: string
  organizationId: string
  organization: { name: string }
  createdAt: string
}

export function InviteModal() {
  const { status, update } = useSession()
  const router = useRouter()
  const [invites, setInvites] = useState<Invite[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null)

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/user/invitations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Invite[]) => setInvites(data))
      .catch(() => {})
  }, [status])

  const invite = invites[current]

  async function respond(action: "accept" | "decline") {
    if (!invite || loading) return
    setLoading(action)
    try {
      const res = await fetch(`/api/invites/${invite.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()

      if (action === "accept") {
        await update()
        router.refresh()
        toast.success(`Joined ${invite.organization.name}!`)
      } else {
        toast.success("Invite declined.")
      }

      // Move to next invite or close
      setInvites((prev) => prev.filter((_, i) => i !== current))
      setCurrent(0)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  if (!invite) return null

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">You have an invitation</DialogTitle>
          <DialogDescription className="text-center">
            You've been invited to join an organization on DITBlogs.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4 flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate">{invite.organization.name}</p>
            <p className="text-xs text-muted-foreground truncate">{invite.email}</p>
          </div>
          {invites.length > 1 && (
            <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
              {current + 1} of {invites.length}
            </span>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            disabled={!!loading}
            onClick={() => respond("decline")}
          >
            {loading === "decline" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
          </Button>
          <Button
            className="flex-1"
            disabled={!!loading}
            onClick={() => respond("accept")}
          >
            {loading === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
