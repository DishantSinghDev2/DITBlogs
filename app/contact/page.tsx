import type { Metadata } from "next"

import { ContactForm } from "@/components/contact-form"
import { getSettings } from "@/lib/api/settings"

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSettings()

  return {
    title: `Contact Us | ${siteConfig.name}`,
    description: `Get in touch with the team at ${siteConfig.name}`,
  }
}

export default async function ContactPage() {
  const siteConfig = await getSettings()

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <ContactForm />
      </div>
    </div>
  )
}
