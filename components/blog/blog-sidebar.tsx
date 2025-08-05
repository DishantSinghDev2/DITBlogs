import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { getPopularTags } from "@/lib/api/tags"

interface BlogSidebarProps {
  categories: any[]
}

export async function BlogSidebar({ categories }: BlogSidebarProps) {
  const tags = await getPopularTags()
  

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/blog" className="flex items-center gap-2">
            <Input name="search" placeholder="Search posts..." className="flex-1" />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories found</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <Link href={`/blog?category=${category.slug}`} className="text-sm hover:underline">
                    {category.name}
                  </Link>
                  <Badge variant="secondary">{category._count.posts}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags found</p>
            ) : (
              tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-muted">
                    {tag.name}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Subscribe to our newsletter to get the latest updates.</p>
          <form action="/api/newsletter/subscribe" method="POST" className="space-y-2">
            <Input name="email" type="email" placeholder="Your email address" required />
            <Button type="submit" className="w-full">
              Subscribe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
