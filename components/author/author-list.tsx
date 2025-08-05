"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { getInitials } from "@/lib/utils"
import type { Author } from "@/lib/api/authors"

interface AuthorsListProps {
  authors: Author[]
  totalPages: number
  currentPage: number
}

export function AuthorsList({ authors, totalPages, currentPage }: AuthorsListProps) {
  const router = useRouter()

  const handlePageChange = (page: number) => {
    router.push(`/author?page=${page}`)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {authors.map((author) => (
          <Card key={author.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 -mt-12 border-4 border-background">
                  <AvatarImage src={author.image || ""} alt={author.name} />
                  <AvatarFallback className="text-lg">{getInitials(author.name)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-4 text-center">
                <Link href={`/author/${author.id}`} className="hover:underline">
                  <h3 className="text-xl font-bold">{author.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground capitalize">{author.role.toLowerCase()}</p>
                {author.bio && <p className="mt-2 text-sm line-clamp-2">{author.bio}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm">
                <span className="font-medium">{author.postsCount}</span> posts
              </div>
              <div className="text-sm">
                <span className="font-medium">{author.followersCount}</span> followers
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  )
}
