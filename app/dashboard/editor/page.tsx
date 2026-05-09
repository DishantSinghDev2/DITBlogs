import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

/**
 * /dashboard/editor  (no ID)
 *
 * This page no longer renders a blank editor — instead it creates a blank
 * draft server-side and immediately redirects to /dashboard/editor/[id].
 * This guarantees the draft ID exists before the user types a single character,
 * so auto-saves always PUT (never POST) and the URL never changes mid-session.
 */
export default async function EditorPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  })

  if (!user?.organizationId) redirect("/dashboard")

  // Create the blank draft server-side so the redirect is instant (no client round-trip)
  const draft = await db.draft.create({
    data: {
      title: "Untitled Post",
      slug: `untitled-${Date.now()}`,
      content: "",
      authorId: session.user.id,
      organizationId: user.organizationId,
    },
    select: { id: true },
  })

  redirect(`/dashboard/editor/${draft.id}`)
}
