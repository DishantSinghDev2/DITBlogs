import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Privacy Policy`,
    description: `Privacy Policy for DITBlogs`,
  }
}

export default async function PrivacyPolicyPage() {

  return (
    <div className="container py-8">
    </div>
  )
}
