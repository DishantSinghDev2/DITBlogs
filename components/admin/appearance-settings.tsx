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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker } from "@/components/admin/color-picker"
import { toast } from "@/hooks/use-toast"

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  fontHeading: z.string(),
  fontBody: z.string(),
  borderRadius: z.string(),
  headerLayout: z.enum(["default", "centered", "minimal"]),
  footerLayout: z.enum(["default", "minimal", "expanded"]),
  customCss: z.string().optional(),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

interface AppearanceSettingsProps {
  siteConfig: {
    appearance: {
      theme: "light" | "dark" | "system"
      primaryColor: string
      secondaryColor: string
      accentColor: string
      fontHeading: string
      fontBody: string
      borderRadius: string
      headerLayout: "default" | "centered" | "minimal"
      footerLayout: "default" | "minimal" | "expanded"
      customCss: string | null
    }
  }
}

export function AppearanceSettings({ siteConfig }: AppearanceSettingsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: siteConfig.appearance.theme || "system",
      primaryColor: siteConfig.appearance.primaryColor || "#4F46E5",
      secondaryColor: siteConfig.appearance.secondaryColor || "#10B981",
      accentColor: siteConfig.appearance.accentColor || "#F59E0B",
      fontHeading: siteConfig.appearance.fontHeading || "Inter",
      fontBody: siteConfig.appearance.fontBody || "Inter",
      borderRadius: siteConfig.appearance.borderRadius || "0.5rem",
      headerLayout: siteConfig.appearance.headerLayout || "default",
      footerLayout: siteConfig.appearance.footerLayout || "default",
      customCss: siteConfig.appearance.customCss || "",
    },
  })

  async function onSubmit(data: AppearanceFormValues) {
    setIsUpdating(true)

    try {
      const response = await fetch("/api/admin/appearance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update appearance settings")
      }

      toast({
        title: "Appearance updated",
        description: "Your site appearance settings have been updated successfully.",
      })

      // Update local storage for faster experience
      localStorage.setItem("site-appearance", JSON.stringify(data))

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appearance settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Tabs defaultValue="theme" className="space-y-6">
      <TabsList>
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="colors">Colors</TabsTrigger>
        <TabsTrigger value="typography">Typography</TabsTrigger>
        <TabsTrigger value="layout">Layout</TabsTrigger>
        <TabsTrigger value="custom">Custom CSS</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose the default theme for your site.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Theme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The default theme for your site. Users can override this in their settings.
                      </FormDescription>
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

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
                <CardDescription>Customize the colors used throughout your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <ColorPicker color={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>The main color used for buttons, links, and accents.</FormDescription>
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
                        <ColorPicker color={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>Used for secondary elements and accents.</FormDescription>
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
                        <ColorPicker color={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription>Used for highlighting and call-to-action elements.</FormDescription>
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

          <TabsContent value="typography">
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Customize the fonts used on your site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="fontHeading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heading Font</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a font" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The font used for headings and titles.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fontBody"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Font</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a font" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The font used for body text and paragraphs.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="borderRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Border Radius</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The border radius for buttons, cards, and other elements (e.g., 0.5rem, 8px).
                      </FormDescription>
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

          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle>Layout</CardTitle>
                <CardDescription>Configure the layout of your site's header and footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="headerLayout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Layout</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a layout" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="centered">Centered</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The layout style for your site's header.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="footerLayout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Layout</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a layout" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="expanded">Expanded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The layout style for your site's footer.</FormDescription>
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

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>Add custom CSS to further customize your site.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="customCss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom CSS</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=".custom-class { color: blue; }"
                          className="font-mono h-[300px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Add custom CSS to override default styles. This will be added to the site's head.
                      </FormDescription>
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
