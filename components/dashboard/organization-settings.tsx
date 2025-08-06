"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Organization } from "@prisma/client";
import { Copy, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const orgFormSchema = z.object({
    name: z.string().min(2),
    website: z.string().url().optional().or(z.literal("")),
});

type OrgFormValues = z.infer<typeof orgFormSchema>;

interface OrganizationSettingsProps {
    organization: Organization;
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [apiKey, setApiKey] = useState(organization.apiKey);

    const form = useForm<OrgFormValues>({
        resolver: zodResolver(orgFormSchema),
        defaultValues: {
            name: organization.name || "",
            website: organization.website || "",
        },
    });

    async function onSubmit(data: OrgFormValues) {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/organization/${organization.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Failed to update organization.");
            toast({ title: "Organization updated" });
            router.refresh();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleRegenerateKey() {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/organization/${organization.id}/regenerate-key`, { method: 'POST' });
            if (!response.ok) throw new Error("Failed to regenerate key.");
            const { apiKey: newApiKey } = await response.json();
            setApiKey(newApiKey);
            toast({ title: "API Key Regenerated", description: "Your new API key is now active." });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDeleteOrganization() {
        setIsUpdating(true);
        try {
            await fetch(`/api/organization/${organization.id}`, { method: 'DELETE' });
            toast({ title: "Organization Deleted", description: "Your organization and all its data have been removed." });
            router.push('/onboarding'); // Redirect user to re-onboard
            router.refresh();
        } catch (error) {
            toast({ title: "Error deleting organization.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Update your organization's name and website.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Org name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="website" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Org website" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>API Key</CardTitle><CardDescription>Use this key to connect your frontend to DITBlogs.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 rounded-md border bg-muted p-2">
                        <Input readOnly value={apiKey} className="border-0 bg-transparent shadow-none" />
                        <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(apiKey); toast({ title: "Copied!" }) }}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={isUpdating}><RefreshCw className="mr-2 h-4 w-4" />Regenerate Key</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will invalidate your old API key. Your application will need to be updated with the new key.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRegenerateKey}>Regenerate</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <h3 className="font-semibold">Delete Organization</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete your organization, including all members, posts, and data. This action cannot be undone.</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isUpdating}>Delete Organization</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your organization. Please confirm.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteOrganization}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}