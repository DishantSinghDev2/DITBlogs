"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, MoreVertical, PlusCircle, Trash2, Edit } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoriesDashboard({ initialCategories }: { initialCategories: any[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [categories, setCategories] = useState(initialCategories);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CategoryFormValues>();

    const handleDialogOpen = (category: any | null) => {
        setEditingCategory(category);
        form.reset(category ? { name: category.name, description: category.description } : { name: '', description: '' });
        setIsDialogOpen(true);
    };

    const handleDeleteDialogOpen = (category: any) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    }

    const onSubmit = async (data: CategoryFormValues) => {
        setIsLoading(true);
        const method = editingCategory ? 'PUT' : 'POST';
        const url = editingCategory ? `/api/organizations/categories/${editingCategory.id}` : '/api/organizations/categories';

        try {
            const response = await fetch(url, { method, body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "An error occurred.");
            }
            toast({ title: `Category ${editingCategory ? 'updated' : 'created'}!` });
            setIsDialogOpen(false);
            setEditingCategory(null);
            router.refresh();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const onDelete = async () => {
        if (!categoryToDelete) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/organizations/categories/${categoryToDelete.id}`, { method: 'DELETE' });
            if(!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }
            toast({ title: "Category deleted." });
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
            router.refresh();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => handleDialogOpen(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
            </div>
            
            {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40 py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-xl font-medium">No Categories Yet</h3>
                    <p className="mt-2 text-muted-foreground">Get started by creating your first content category.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map(cat => (
                        <Card key={cat.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleDialogOpen(cat)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteDialogOpen(cat)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription>{cat._count.posts} post{cat._count.posts !== 1 && 's'}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{cat.description || "No description provided."}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingCategory ? 'Edit' : 'Create'} Category</DialogTitle><DialogDescription>Fill in the details for your category.</DialogDescription></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation Dialog */}
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. You cannot delete a category that still has posts assigned to it.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">{isLoading ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}