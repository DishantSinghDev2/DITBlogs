"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { UserPlus } from "lucide-react";

export function NewsletterDashboard({ initialSubscribers }: { initialSubscribers: any[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAddSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/organizations/newsletters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                const error = await response.text();
                toast({ title: "Error", description: error, variant: "destructive" });
                return;
            }
            toast({ title: "Subscriber Added" });
            setEmail("");
            setIsAddDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Active Subscribers</CardTitle>
                    <CardDescription>This list will receive your weekly post digests.</CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Add Subscriber</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Subscribed On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialSubscribers.map(sub => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.email}</TableCell>
                                <TableCell>{format(new Date(sub.createdAt), 'LLL dd, yyyy')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Subscriber</DialogTitle><DialogDescription>Enter the email address to add to your newsletter.</DialogDescription></DialogHeader>
                    <form onSubmit={handleAddSubscriber} className="space-y-4 pt-4">
                        <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Subscriber"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}