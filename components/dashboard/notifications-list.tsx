"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCheck, BellRing, MessageSquare, CornerUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils"; // Assuming you have a getInitials utility

// Update props interface to reflect the enriched notification data
interface NotificationsListProps {
  notifications: Array<{
    id: string;
    read: boolean;
    type: string;
    message: string;
    createdAt: string;
    actor: {
      name: string | null;
      image: string | null;
    };
    context: {
      postSlug: string;
    } | null;
    relatedId: string | null;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  unreadCount: number;
}

// A helper to get the right icon for the notification type
const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'reply':
      return <CornerUpRight className="h-4 w-4" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};


export function NotificationsList({ notifications, pagination, unreadCount }: NotificationsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { permission, requestPermission } = useBrowserNotifications();


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
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40 py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-xl font-medium">All Caught Up!</h3>
        <p className="mt-2 text-muted-foreground">You don't have any new notifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- FIX: Add the browser notification permission prompt --- */}
      {permission === 'default' && (
        <Alert>
          <BellRing className="h-4 w-4" />
          <AlertTitle>Enable Browser Notifications</AlertTitle>
          <AlertDescription>
            Get notified in real-time about new comments and replies, even when you're not on this page.
            <Button variant="link" onClick={requestPermission} className="p-0 h-auto ml-2">Enable Notifications</Button>
          </AlertDescription>
        </Alert>
      )}

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

      {/* --- CUTE & ADVANCED NOTIFICATION LIST --- */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start space-x-4 rounded-lg border p-4 transition-colors ${
              !notification.read ? "bg-muted/50" : "bg-background"
            }`}
          >
            {/* Actor's Avatar */}
            <Avatar className="h-9 w-9">
              <AvatarImage src={notification.actor.image || ""} alt={notification.actor.name || 'User'} />
              <AvatarFallback>{getInitials(notification.actor.name || 'A')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1.5">
              {/* The Message with a clickable link */}
              <p className="text-sm">
                <span className="font-semibold">{notification.actor.name || 'Someone'}</span>
                {/* Use the context to create a link */}
                {notification.context?.postSlug ? (
                  <Link href={`/blog/${notification.context.postSlug}#comment-${notification.relatedId}`} className="hover:underline">
                    {' '}{notification.message.split(': ')[1] || notification.message}
                  </Link>
                ) : (
                  <span>{' '}{notification.message}</span>
                )}
              </p>
              
              {/* Timestamp and Icon */}
              <div className="flex items-center text-xs text-muted-foreground">
                <NotificationIcon type={notification.type} />
                <span className="ml-1.5">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {/* Mark as Read Button (only for unread notifications) */}
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => handleMarkAsRead(notification.id)}
                disabled={isLoading}
                aria-label="Mark as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
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
