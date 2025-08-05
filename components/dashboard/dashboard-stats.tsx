import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Eye, MessageSquare, FileEdit } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    postCount: number
    viewCount: number
    commentCount: number
    draftCount: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      title: "Total Posts",
      value: stats.postCount,
      icon: FileText,
      description: "Published posts",
    },
    {
      title: "Total Views",
      value: stats.viewCount,
      icon: Eye,
      description: "All-time post views",
    },
    {
      title: "Comments",
      value: stats.commentCount,
      icon: MessageSquare,
      description: "Across all posts",
    },
    {
      title: "Drafts",
      value: stats.draftCount,
      icon: FileEdit,
      description: "Unpublished posts",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
