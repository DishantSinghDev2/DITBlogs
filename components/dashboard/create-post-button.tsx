"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Props {
  className?: string
  /** When true, renders full-width (used inside sidebar) */
  fullWidth?: boolean
}

export function CreatePostButton({ className, fullWidth }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/drafts/new", { method: "POST" })
      if (!res.ok) throw new Error()
      const { id } = await res.json()
      router.push(`/dashboard/editor/${id}`)
    } catch {
      toast.error("Couldn't create a new post. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCreate}
      disabled={loading}
      className={cn(fullWidth && "w-full", className)}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <PenTool className="w-4 h-4" />
      )}
      Create Post
    </Button>
  )
}
