import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryShowcaseProps {
  config: {
    title: string
    showPostCount: boolean
  }
}

// This would normally be fetched from the API
const categories = [
  {
    id: "1",
    name: "Technology",
    description: "Latest tech news and reviews",
    slug: "technology",
    postCount: 42,
    icon: "💻",
  },
  {
    id: "2",
    name: "Travel",
    description: "Explore destinations around the world",
    slug: "travel",
    postCount: 28,
    icon: "✈️",
  },
  {
    id: "3",
    name: "Food",
    description: "Recipes and culinary adventures",
    slug: "food",
    postCount: 35,
    icon: "🍔",
  },
  {
    id: "4",
    name: "Health",
    description: "Tips for a healthy lifestyle",
    slug: "health",
    postCount: 19,
    icon: "💪",
  },
  {
    id: "5",
    name: "Business",
    description: "Insights for entrepreneurs",
    slug: "business",
    postCount: 24,
    icon: "💼",
  },
  {
    id: "6",
    name: "Art",
    description: "Creative inspiration and showcases",
    slug: "art",
    postCount: 17,
    icon: "🎨",
  },
]

export function CategoryShowcase({ config }: CategoryShowcaseProps) {
  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tighter">{config.title}</h2>
            <p className="text-gray-500 dark:text-gray-400">Browse content by category</p>
          </div>
        </div>
        <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2 text-2xl">{category.icon}</span>
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {config.showPostCount && <p className="text-sm text-muted-foreground">{category.postCount} posts</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
