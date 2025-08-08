import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenTool } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function BlogHeader() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-b pb-8 text-center sm:flex-row sm:text-left">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">Explore our latest articles, tutorials, and insights.</p>
      </div>
    </div>
  )
}
