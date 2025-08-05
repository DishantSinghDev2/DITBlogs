import { HomeHero } from "@/components/home/home-hero"
import { FeaturedPosts } from "@/components/home/featured-posts"
import { CategoryShowcase } from "@/components/home/category-showcase"
import { NewsletterCta } from "@/components/home/newsletter-cta"
import { getHomePageConfig, getFeaturedPosts } from "@/lib/api/posts"

export default async function HomePage() {
  const homeConfig = await getHomePageConfig()
  const featuredPosts = await getFeaturedPosts()

  return (
    <main className="container mx-auto px-4 py-8">
      <HomeHero config={homeConfig.hero} />
      <FeaturedPosts posts={featuredPosts} config={homeConfig.featuredSection} />
      <CategoryShowcase config={homeConfig.categories} />
      {homeConfig.showNewsletter && <NewsletterCta />}
    </main>
  )
}
