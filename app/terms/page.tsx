import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `ToS`,
    description: `Terms of Service for DITBlogs`,
  }
}

export default async function TermsPage() {

  return (
    <div className="container py-8">
    </div>
  )
}
