import type { Metadata } from "next"
import { NewsletterForm } from "@/components/newsletter/newsletter-form"

export const metadata: Metadata = {
  title: "Newsletter | InkPress",
  description: "Subscribe to our newsletter to get the latest updates and articles.",
}

export default function NewsletterPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Newsletter</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Subscribe to our newsletter to get the latest updates and articles delivered straight to your inbox.
        </p>
        <div className="mt-8">
          <NewsletterForm />
        </div>
      </div>
    </main>
  )
}
