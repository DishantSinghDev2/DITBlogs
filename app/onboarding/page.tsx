import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import OnboardingFlow from "@/components/OnboardingFlow"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  // Resolve user ID from session — token.sub is always set by NextAuth
  const userId = session?.user?.id ?? (session as any)?.token?.sub
  if (!userId) redirect("/auth/login")

  // Query DB directly — don't rely on potentially stale session/JWT fields
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true, organizationId: true },
  })

  if (dbUser?.onboardingCompleted || dbUser?.organizationId) {
    redirect("/dashboard")
  }

  return <OnboardingFlow />
}