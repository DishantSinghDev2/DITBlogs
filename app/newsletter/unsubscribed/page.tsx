import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Unsubscribed | InkPress Newsletter",
  description: "You have been successfully unsubscribed from our newsletter.",
}

export default function UnsubscribedPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Unsubscribed</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You have been successfully unsubscribed from our newsletter.
        </p>
        <p className="mt-2 text-muted-foreground">
          We're sorry to see you go. If you change your mind, you can always subscribe again.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
