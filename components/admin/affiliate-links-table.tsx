"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Trash2, ExternalLink, Copy } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface AffiliateLinksTableProps {
  affiliateLinks: any[]
}

export function AffiliateLinksTable({ affiliateLinks }: AffiliateLinksTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null)
  const [linkToEdit, setLinkToEdit] = useState<any | null>(null)
  const [newLink, setNewLink] = useState({
    name: "",
    url: "",
    description: "",
    shortCode: "",
    active: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  async function handleDeleteLink() {
    if (!linkToDelete) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/affiliate-links?id=${linkToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete affiliate link")
      }

      toast({
        title: "Affiliate link deleted",
        description: "The affiliate link has been deleted successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete affiliate link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setLinkToDelete(null)
    }
  }

  async function handleEditLink(e: React.FormEvent) {
    e.preventDefault()
    if (!linkToEdit) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/affiliate-links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(linkToEdit),
      })

      if (!response.ok) {
        throw new Error("Failed to update affiliate link")
      }

      toast({
        title: "Affiliate link updated",
        description: "The affiliate link has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update affiliate link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsEditDialogOpen(false)
      setLinkToEdit(null)
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()

    setIsLoading(true)

    try {
      const response = await fetch("/api/affiliate-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLink),
      })

      if (!response.ok) {
        throw new Error("Failed to add affiliate link")
      }

      toast({
        title: "Affiliate link added",
        description: "The affiliate link has been added successfully.",
      })

      setNewLink({
        name: "",
        url: "",
        description: "",
        shortCode: "",
        active: true,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add affiliate link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsAddDialogOpen(false)
    }
  }

  function copyShortCode(shortCode: string) {
    const baseUrl = window.location.origin
    const fullUrl = `${baseUrl}/go/${shortCode}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: "Link copied",
      description: "The affiliate link has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Short Code</TableHead>
              <TableHead className="hidden md:table-cell">URL</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliateLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No affiliate links found. Add your first link!
                </TableCell>
              </TableRow>
            ) : (
              affiliateLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="font-medium">{link.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:hidden">{link.shortCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{link.shortCode}</span>
                      <Button variant="ghost" size="icon" onClick={() => copyShortCode(link.shortCode)}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center space-x-2">
                      <span className="truncate max-w-[200px]">{link.url}</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open</span>
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {link.active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setLinkToEdit(link)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyShortCode(link.shortCode)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setLinkToDelete(link.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the affiliate link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Affiliate Link</DialogTitle>
            <DialogDescription>Update your affiliate link details.</DialogDescription>
          </DialogHeader>
          {linkToEdit && (
            <form onSubmit={handleEditLink} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={linkToEdit.name}
                  onChange={(e) => setLinkToEdit({ ...linkToEdit, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  URL
                </label>
                <Input
                  id="url"
                  type="url"
                  value={linkToEdit.url}
                  onChange={(e) => setLinkToEdit({ ...linkToEdit, url: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="shortCode" className="text-sm font-medium">
                  Short Code
                </label>
                <Input
                  id="shortCode"
                  value={linkToEdit.shortCode}
                  onChange={(e) => setLinkToEdit({ ...linkToEdit, shortCode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={linkToEdit.description || ""}
                  onChange={(e) => setLinkToEdit({ ...linkToEdit, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={linkToEdit.active}
                  onCheckedChange={(checked) => setLinkToEdit({ ...linkToEdit, active: checked })}
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Active
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Affiliate Link</DialogTitle>
            <DialogDescription>Add a new affiliate link to your collection.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLink} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="new-name"
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="new-url"
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-shortCode" className="text-sm font-medium">
                Short Code
              </label>
              <Input
                id="new-shortCode"
                value={newLink.shortCode}
                onChange={(e) => setNewLink({ ...newLink, shortCode: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="new-description"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="new-active"
                checked={newLink.active}
                onCheckedChange={(checked) => setNewLink({ ...newLink, active: checked })}
              />
              <label htmlFor="new-active" className="text-sm font-medium">
                Active
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
