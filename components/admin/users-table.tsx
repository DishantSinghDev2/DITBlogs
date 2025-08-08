"use client"

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Search, X, UserPlus } from "lucide-react";
import { UserRole } from "@prisma/client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X as XIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface UsersTableProps {
  users: any[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  },
  pendingRequests: any[]; // Add new prop

}

export function UsersTable({ users, pagination, pendingRequests }: UsersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // NEW: Handler for the invite form
  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/organizations/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        toast({ title: "Error", description: errorData, variant: "destructive" });
        return;
      }

      toast({ title: "Invitation Sent", description: `An invitation has been sent to ${inviteEmail}.` });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
    } catch (error: any) {
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveMember() {
    if (!userToRemove) return;
    setIsLoading(true);

    try {
      // FIX: Call the correct, scoped API endpoint
      const response = await fetch(`/api/organizations/members/${userToRemove}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }
      toast({ title: "Member Removed", description: "The user has been removed from the organization." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsRemoveDialogOpen(false);
      setUserToRemove(null);
    }
  }

  async function handleRequestAction(requestId: string, action: 'approve' | 'reject') {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error(`Failed to ${action} request.`);
      toast({ title: `Request ${action}d`, description: "The member list has been updated." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: `Could not ${action} the request.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }


  async function handleEditRole(e: React.FormEvent) {
    e.preventDefault();
    if (!userToEdit) return;
    setIsLoading(true);

    try {
      // FIX: Call the correct API and only send the role
      const response = await fetch(`/api/organizations/members/${userToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: userToEdit.role }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      toast({ title: "Role Updated", description: "The member's role has been updated." });
      router.refresh();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsEditDialogOpen(false);
      setUserToEdit(null);
    }
  }

  // FIX: Update navigation paths to point to /dashboard/members
  function handleSearch(value: string) {
    setSearchQuery(value)
    router.push(`/dashboard/members?search=${encodeURIComponent(value)}${roleFilter ? `&role=${roleFilter}` : ""}`);
  }

  function handleRoleFilterChange(value: string) {
    setRoleFilter(value);
    const newRole = value === 'all' ? '' : value;
    router.push(`/dashboard/members?${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ""}${newRole ? `role=${newRole}` : ""}`);
  }

  function clearFilters() {
    setRoleFilter("");
    router.push("/dashboard/members");
  }

  return (
    <Tabs defaultValue="members" className="space-y-4">
      <TabsList>
        <TabsTrigger value="members">Current Members</TabsTrigger>
        <TabsTrigger value="requests">
          Pending Requests
          {pendingRequests.length > 0 && (
            <Badge variant='secondary' className="ml-2">{pendingRequests.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
      {/* --- FIX: Add the Invite Member button --- */}
      <button className="p-2 bg-transparent ml-2 transition duration-200 dark:hover:bg-gray-500 hover:bg-gray-200  rounded-md" onClick={() => setIsInviteDialogOpen(true)}>
        <UserPlus className="h-4 w-4" />
      </button>

      <TabsContent value="members">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full lg:w-[300px]"
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value={UserRole.ORG_ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                  <SelectItem value={UserRole.WRITER}>Writer</SelectItem>
                </SelectContent>
              </Select>
              {(roleFilter) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Posts</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || ""} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "editor"
                                ? "secondary"
                                : user.role === "writer"
                                  ? "outline"
                                  : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user._count.posts}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setUserToEdit(user); setIsEditDialogOpen(true); }} disabled={user.role === 'ORG_ADMIN'}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setUserToRemove(user.id); setIsRemoveDialogOpen(true); }} className="text-red-600" disabled={user.role === 'ORG_ADMIN'}>
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Member
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

          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => {
                const url = new URL(window.location.href)
                url.searchParams.set("page", page.toString())
                router.push(url.toString())
              }}
            />
          )}

          {/* FIX: Update Delete Dialog to "Remove" Dialog */}
          <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the user from your organization. They will lose their role and access. This action can be reversed by re-inviting them.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveMember} disabled={isLoading}>
                  {isLoading ? "Removing..." : "Remove"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* FIX: Simplify Edit Dialog to only manage roles */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Member Role</DialogTitle>
                <DialogDescription>Change the role for {userToEdit?.name}.</DialogDescription>
              </DialogHeader>
              {userToEdit && (
                <form onSubmit={handleEditRole} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">Role</label>
                    <Select value={userToEdit.role} onValueChange={(value) => setUserToEdit({ ...userToEdit, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                        <SelectItem value={UserRole.WRITER}>Writer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Role"}</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      <TabsContent value="requests">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Approve or reject requests to join your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center">No pending requests.</TableCell></TableRow>
                ) : (
                  pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarImage src={request.user.image || ""} /><AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium">{request.user.name}</div>
                            <div className="text-sm text-muted-foreground">{request.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground italic">"{request.message || 'No message provided'}"</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleRequestAction(request.id, 'reject')} disabled={isLoading}>
                            <XIcon className="h-4 w-4 mr-2" /> Reject
                          </Button>
                          <Button size="sm" onClick={() => handleRequestAction(request.id, 'approve')} disabled={isLoading}>
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* --- FIX: Add the new Dialog for sending invites --- */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a New Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to invite. They will receive an email with instructions to join your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading || !inviteEmail}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>

  )
}
