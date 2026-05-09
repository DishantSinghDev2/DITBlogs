import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import OnboardingFlow from "@/components/OnboardingFlow"

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.onboardingCompleted || session?.user?.organizationId) {
    redirect("/dashboard")
  }
  return <OnboardingFlow />
}