"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"

interface NotificationsListProps {
  notifications: any[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
  unreadCount: number
}

export function NotificationsList({ notifications, pagination, unreadCount }: NotificationsListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function handleMarkAsRead(id: string) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMarkAllAsRead() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      toast({
        title: "Success",
        description: "All notifications marked as read.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No notifications</h3>
        <p className="mt-2 text-sm text-muted-foreground">You don't have any notifications yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
        </p>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={isLoading}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.read ? "bg-background" : "bg-muted/30 border-primary/20"}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{notification.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm">{notification.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(page) => router.push(`/dashboard/notifications?page=${page}`)}
        />
      )}
    </div>
  )
}
