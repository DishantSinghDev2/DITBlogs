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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

const seoFormSchema = z.object({
  metaTitle: z.string().max(60, {
    message: "Meta title should be 60 characters or less.",
  }),
  metaDescription: z.string().max(160, {
    message: "Meta description should be 160 characters or less.",
  }),
  ogTitle: z.string().max(60, {
    message: "OG title should be 60 characters or less.",
  }),
  ogDescription: z.string().max(160, {
    message: "OG description should be 160 characters or less.",
  }),
  ogImage: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  twitterTitle: z.string().max(60, {
    message: "Twitter title should be 60 characters or less.",
  }),
  twitterDescription: z.string().max(160, {
    message: "Twitter description should be 160 characters or less.",
  }),
  twitterImage: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  canonicalUrl: z.string().url({ message: "Please enter a valid URL." }),
  robotsTxt: z.string(),
  sitemapEnabled: z.boolean(),
  schemaOrgEnabled: z.boolean(),
  googleAnalyticsId: z.string().optional().or(z.literal("")),
  googleTagManagerId: z.string().optional().or(z.literal("")),
  metaPixelId: z.string().optional().or(z.literal("")),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

interface SeoSettingsProps {
  siteConfig: {
    seo: {
      metaTitle: string
      metaDescription: string
      ogTitle: string
      ogDescription: string
      ogImage: string | null
      twitterTitle: string
      twitterDescription: string
      twitterImage: string | null
      canonicalUrl: string
      robotsTxt: string
      sitemapEnabled: boolean
      schemaOrgEnabled: boolean
      googleAnalyticsId: string | null
      googleTagManagerId: string | null
      metaPixelId: string | null
    }
  }
}

export function SeoSettings({ siteConfig }: SeoSettingsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      metaTitle: siteConfig.seo.metaTitle || "",
      metaDescription: siteConfig.seo.metaDescription || "",
      ogTitle: siteConfig.seo.ogTitle || "",
      ogDescription: siteConfig.seo.ogDescription || "",
      ogImage: siteConfig.seo.ogImage || "",
      twitterTitle: siteConfig.seo.twitterTitle || "",
      twitterDescription: siteConfig.seo.twitterDescription || "",
      twitterImage: siteConfig.seo.twitterImage || "",
      canonicalUrl: siteConfig.seo.canonicalUrl || "",
      robotsTxt: siteConfig.seo.robotsTxt || "User-agent: *\nAllow: /",
      sitemapEnabled: siteConfig.seo.sitemapEnabled,
      schemaOrgEnabled: siteConfig.seo.schemaOrgEnabled,
      googleAnalyticsId: siteConfig.seo.googleAnalyticsId || "",
      googleTagManagerId: siteConfig.seo.googleTagManagerId || "",
      metaPixelId: siteConfig.seo.metaPixelId || "",
    },
  })

  async function onSubmit(data: SeoFormValues) {
    setIsUpdating(true)

    try {
      const response = await fetch("/api/admin/seo", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update SEO settings")
      }

      toast({
        title: "SEO settings updated",
        description: "Your site SEO settings have been updated successfully.",
      })

      // Update local storage for faster experience
      localStorage.setItem("site-seo", JSON.stringify(data))

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update SEO settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Tabs defaultValue="meta" className="space-y-6">
      <TabsList>
        <TabsTrigger value="meta">Meta Tags</TabsTrigger>
        <TabsTrigger value="social">Social Media</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="meta">
            <Card>
              <CardHeader>
                <CardTitle>Meta Tags</CardTitle>
                <CardDescription>Configure the meta tags for your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The title that appears in search engine results.
                        {field.value.length > 0 && (
                          <span className={field.value.length > 60 ? "text-destructive" : ""}>
                            {" "}
                            ({field.value.length}/60)
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        The description that appears in search engine results.
                        {field.value.length > 0 && (
                          <span className={field.value.length > 160 ? "text-destructive" : ""}>
                            {" "}
                            ({field.value.length}/160)
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="canonicalUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canonical URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>The canonical URL for your site (e.g., https://example.com).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Configure how your site appears when shared on social media.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Open Graph</h3>
                  <FormField
                    control={form.control}
                    name="ogTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OG Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The title that appears when your site is shared on Facebook and other platforms.
                          {field.value.length > 0 && (
                            <span className={field.value.length > 60 ? "text-destructive" : ""}>
                              {" "}
                              ({field.value.length}/60)
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ogDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OG Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          The description that appears when your site is shared on Facebook and other platforms.
                          {field.value.length > 0 && (
                            <span className={field.value.length > 160 ? "text-destructive" : ""}>
                              {" "}
                              ({field.value.length}/160)
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ogImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OG Image</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          The image that appears when your site is shared on Facebook and other platforms. Recommended
                          size: 1200x630 pixels.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Twitter</h3>
                  <FormField
                    control={form.control}
                    name="twitterTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The title that appears when your site is shared on Twitter.
                          {field.value.length > 0 && (
                            <span className={field.value.length > 60 ? "text-destructive" : ""}>
                              {" "}
                              ({field.value.length}/60)
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitterDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          The description that appears when your site is shared on Twitter.
                          {field.value.length > 0 && (
                            <span className={field.value.length > 160 ? "text-destructive" : ""}>
                              {" "}
                              ({field.value.length}/160)
                            </span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitterImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter Image</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          The image that appears when your site is shared on Twitter. Recommended size: 1200x600 pixels.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced SEO</CardTitle>
                <CardDescription>Configure advanced SEO settings for your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="robotsTxt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>robots.txt</FormLabel>
                      <FormControl>
                        <Textarea className="font-mono h-[200px]" {...field} />
                      </FormControl>
                      <FormDescription>Configure the robots.txt file for your site.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sitemapEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sitemap</FormLabel>
                        <FormDescription>Automatically generate a sitemap.xml file.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schemaOrgEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Schema.org</FormLabel>
                        <FormDescription>Add Schema.org JSON-LD markup to your pages.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Configure analytics tracking for your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="googleAnalyticsId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Analytics ID</FormLabel>
                      <FormControl>
                        <Input placeholder="G-XXXXXXXXXX" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Your Google Analytics measurement ID (e.g., G-XXXXXXXXXX).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="googleTagManagerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Tag Manager ID</FormLabel>
                      <FormControl>
                        <Input placeholder="GTM-XXXXXXX" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Your Google Tag Manager container ID (e.g., GTM-XXXXXXX).</FormDescription>
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
                        <Input placeholder="XXXXXXXXXX" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Your Meta (Facebook) Pixel ID.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  )
}
