"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { CalendarIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { followAuthor, isFollowingAuthor } from "@/lib/api/authors"
import { formatDate, getInitials } from "@/lib/utils"
import type { Author } from "@/lib/api/authors"

interface AuthorProfileProps {
  author: Author
}

export function AuthorProfile({ author }: AuthorProfileProps) {
  const { data: session } = useSession()
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is following author on component mount
  useState(() => { 
    const checkFollowStatus = async () => {
      if (session?.user?.id) {
        const following = await isFollowingAuthor(author.id, session.user.id)
        setIsFollowing(following)
      }
    }

    checkFollowStatus()
  }, [session?.user?.id])

  const handleFollowToggle = async () => {
    if (!session?.user?.id) {
      // Redirect to login or show login modal
      window.location.href = "/auth/login?callbackUrl=" + encodeURIComponent(window.location.href)
      return
    }

    setIsLoading(true)
    try {
      const result = await followAuthor(author.id, session.user.id)
      setIsFollowing(result.following)
    } catch (error) {
      console.error("Failed to toggle follow status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            <AvatarImage src={author.image || ""} alt={author.name} />
            <AvatarFallback className="text-2xl">{getInitials(author.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold">{author.name}</h1>
            <p className="text-muted-foreground capitalize mt-1">{author.role.toLowerCase()}</p>

            {author.bio && <p className="mt-4">{author.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-6 justify-center sm:justify-start">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Joined {formatDate(author.createdAt)}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{author.postsCount}</span> posts
              </div>
              <div className="text-sm">
                <span className="font-medium">{author.followersCount}</span> followers
              </div>
            </div>
          </div>

          <div>
            {session?.user?.id !== author.id && (
              <Button
                onClick={handleFollowToggle}
                disabled={isLoading || isFollowing === null}
                variant={isFollowing ? "outline" : "default"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
