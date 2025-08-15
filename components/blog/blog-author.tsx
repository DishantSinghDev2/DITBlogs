import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface BlogAuthorProps {
  author: any
}

export function BlogAuthor({ author }: BlogAuthorProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-muted p-6 text-center sm:flex-row sm:text-left">
      <Avatar className="h-16 w-16">
        <AvatarImage src={author.image || ""} alt={author.name} />
        <AvatarFallback>
          {author.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <h3 className="text-xl font-medium">{author.name}</h3>
        {author.bio && <p className="text-muted-foreground">{author.bio}</p>}
      </div>
      <Button asChild variant="outline">
        NA - Just a Demo
      </Button>
    </div>
  )
}
