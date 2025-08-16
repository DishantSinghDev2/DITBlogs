import type { Metadata } from "next"

import { ContactForm } from "@/components/contact-form"

export async function generateMetadata(): Promise<Metadata> {

  return {
    title: `Contact Us`,
    description: `Get in touch with the team at DITBlogs`,
  }
}

export default async function ContactPage() {

  return (
    <div className=" py-8">
      <div className="max-w-2xl mx-auto">
        <ContactForm />
      </div>
    </div>
  )
}
