import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"
import OnboardingFlow from "@/components/OnboardingFlow"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  // session.user.id is now guaranteed (falls back to token.sub in session callback)
  const userId = session?.user?.id
  if (!userId) redirect("/auth/login")

  // Query DB directly — never trust stale JWT fields for onboarding state
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true, organizationId: true },
  })

  if (dbUser?.onboardingCompleted || dbUser?.organizationId) {
    redirect("/dashboard")
  }

  return <OnboardingFlow />
}