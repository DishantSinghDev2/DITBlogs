import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HomeHeroProps {
  config: {
    title: string
    subtitle: string
    showFeaturedPost: boolean
  }
}

export function HomeHero({ config }: HomeHeroProps) {
  return (
    <div className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">{config.title}</h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">{config.subtitle}</p>
          </div>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/blog">Explore Blog</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
