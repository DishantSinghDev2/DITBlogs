"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/admin/color-picker"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  siteUrl: z.string().url("Please enter a valid URL"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  googleAnalyticsId: z.string().optional(),
  metaPixelId: z.string().optional(),
  adsenseId: z.string().optional(),
  defaultLanguage: z.string().min(2, "Language code is required"),
  enableComments: z.boolean(),
  enableNewsletter: z.boolean(),
  enableDarkMode: z.boolean(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface AdminSettingsProps {
  initialSettings: any
}

export function AdminSettings({ initialSettings }: AdminSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: initialSettings?.siteName || "InkPress",
      siteDescription: initialSettings?.siteDescription || "A modern blogging and publishing platform",
      siteUrl: initialSettings?.siteUrl || "",
      logoUrl: initialSettings?.logoUrl || "",
      faviconUrl: initialSettings?.faviconUrl || "",
      primaryColor: initialSettings?.primaryColor || "#3b82f6",
      secondaryColor: initialSettings?.secondaryColor || "#10b981",
      accentColor: initialSettings?.accentColor || "#8b5cf6",
      googleAnalyticsId: initialSettings?.googleAnalyticsId || "",
      metaPixelId: initialSettings?.metaPixelId || "",
      adsenseId: initialSettings?.adsenseId || "",
      defaultLanguage: initialSettings?.defaultLanguage || "en",
      enableComments: initialSettings?.enableComments !== false,
      enableNewsletter: initialSettings?.enableNewsletter !== false,
      enableDarkMode: initialSettings?.enableDarkMode !== false,
    },
  })

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      toast({
        title: "Settings updated",
        description: "Your site settings have been updated successfully.",
      })

      // Clear localStorage cache to force refresh of site config
      localStorage.removeItem("site_config")

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure the basic information for your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>The name of your site that will appear in the header and title.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>A brief description of your site for SEO and social sharing.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" />
                      </FormControl>
                      <FormDescription>The full URL of your site, used for SEO and social sharing.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Language</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="en" />
                      </FormControl>
                      <FormDescription>The default language code for your site (e.g., en, fr, es).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="/logo.svg" />
                      </FormControl>
                      <FormDescription>The URL to your site logo image.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faviconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="/favicon.ico" />
                      </FormControl>
                      <FormDescription>The URL to your site favicon.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <ColorPicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>The primary color for buttons and accents.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <ColorPicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>The secondary color for backgrounds and elements.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <FormControl>
                        <ColorPicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>The accent color for highlights and special elements.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableDarkMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Dark Mode</FormLabel>
                        <FormDescription>Allow users to switch between light and dark mode.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect your site with third-party services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="googleAnalyticsId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Analytics ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="G-XXXXXXXXXX" />
                      </FormControl>
                      <FormDescription>Your Google Analytics measurement ID.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaPixelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Pixel ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XXXXXXXXXXXXXXXXXX" />
                      </FormControl>
                      <FormDescription>Your Meta (Facebook) Pixel ID for tracking conversions.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adsenseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google AdSense ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ca-pub-XXXXXXXXXXXXXXXX" />
                      </FormControl>
                      <FormDescription>Your Google AdSense publisher ID.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Enable or disable site features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableComments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Comments</FormLabel>
                        <FormDescription>Allow users to comment on blog posts.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableNewsletter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Newsletter</FormLabel>
                        <FormDescription>Enable newsletter subscription functionality.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
