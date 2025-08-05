import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface BlogPostCardProps {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featuredImage: string | null;
        createdAt: Date | null;
        author: {
            id: string;
            name: string;
            image: string | null;
        };
    };
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Card key={post.id} className="overflow-hidden">
      {post.featuredImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author.image || ""} alt={post.author.name} />
            <AvatarFallback>
              {post.author.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <Link href={`/author/${post.author.id}`} className="font-medium hover:underline">
              {post.author.name}
            </Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(post.createdAt), {
            addSuffix: true,
          })}
        </div>
      </CardFooter>
    </Card>
  );
};
