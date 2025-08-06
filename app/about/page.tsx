import type { Metadata } from "next"
import { notFound } from "next/navigation"


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description: ""
  }
 
}

export default async function AboutPage() {
}
