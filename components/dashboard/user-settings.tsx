"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"

// FIX: Remove 'website' from the profile schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z.string().optional(),
});

// FIX: Remove irrelevant notification options
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  newComment: z.boolean(),
});


type ProfileFormValues = z.infer<typeof profileFormSchema>
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

interface UserSettingsProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
    bio: string | null
    emailVerified: boolean
    notificationSettings: {
      emailNotifications: boolean
      marketingEmails: boolean
      newComment: boolean
      newPost: boolean
    }
  }
}

export function UserSettings({ user }: UserSettingsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    // FIX: Remove default value for 'website'
    defaultValues: { name: user.name || "", bio: user.bio || "" },
  });


  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: user.notificationSettings?.emailNotifications ?? true,
      marketingEmails: user.notificationSettings?.marketingEmails ?? false,
      newComment: user.notificationSettings?.newComment ?? true,
    },
  })

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      // Update local storage for faster experience
      const userData = {
        ...user,
        name: data.name,
        bio: data.bio
      }
      localStorage.setItem("user-profile", JSON.stringify(userData))

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  async function onNotificationsSubmit(data: NotificationsFormValues) {
    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been updated successfully.",
      })

      // Update local storage for faster experience
      const userData = {
        ...user,
        notificationSettings: data,
      }
      localStorage.setItem("user-notification-settings", JSON.stringify(userData))

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information and public profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself"
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Brief description for your profile. URLs are hyperlinked.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationsForm}>
              <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                <FormField
                  control={notificationsForm.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>Receive notifications via email.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={notificationsForm.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Marketing Emails</FormLabel>
                        <FormDescription>Receive emails about new features and updates.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={notificationsForm.control}
                  name="newComment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Comments</FormLabel>
                        <FormDescription>When someone comments on your posts.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Save preferences"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Email Address</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">{user.emailVerified ? "Verified" : "Not verified"}</p>
              <Button variant="outline" size="sm">
                <a target="_blank" href="https://whatsyour.info/settings">
                  Verify on WYI
                </a>
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-muted-foreground">Passwords are managed by WhatsYour.Info.</p>
              <Button variant="outline" size="sm">
                <a target="_blank" href="https://whatsyour.info/settings">
                  WYI Settings
                </a>
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">To delete this account please visit WhatsYour.Info - Profile - Account Settings.</p>
              <Button variant="outline" size="sm">
                <a target="_blank" href="https://whatsyour.info/profile">
                  WYI Profile
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
