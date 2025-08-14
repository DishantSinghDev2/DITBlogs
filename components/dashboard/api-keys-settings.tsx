// /components/dashboard/api-keys-settings.tsx (NEW FILE)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiKey } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Import all AlertDialog components

const createKeySchema = z.object({
  name: z.string().min(2, "Key name is required."),
});
type CreateKeyValues = z.infer<typeof createKeySchema>;

export function ApiKeysSettings({
  organizationId,
  apiKeys,
}: {
  organizationId: string;
  apiKeys: ApiKey[];
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);

  const form = useForm<CreateKeyValues>({ resolver: zodResolver(createKeySchema) });

  async function onSubmit(data: CreateKeyValues) {
    setIsCreating(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, orgId: organizationId }),
      });
      if (!response.ok) throw new Error("Failed to create key.");
      toast({ title: "API Key Created" });
      form.reset({ name: "" });
      router.refresh();
    } catch (e) {
      toast({ title: "Error creating key", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteKey(keyId: string) {
    setIsDeleting(keyId);
    try {
        await fetch(`/api/keys/${keyId}`, { method: 'DELETE' });
        toast({ title: "API Key Revoked" });
        router.refresh();
    } catch (e) {
        toast({ title: "Error revoking key", variant: "destructive" });
    } finally {
        setIsDeleting(null);
    }
  }

  const toggleShowKey = (keyId: string) => {
    setShowKey(current => (current === keyId ? null : keyId));
  };
  
  return (
    <div className="space-y-8">
        {/* Create Key Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="font-medium">Create a new key</h3>
            <div className="flex gap-4">
                <Input {...form.register("name")} placeholder="e.g., Production Key" />
                <Button type="submit" disabled={isCreating}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    {isCreating ? "Creating..." : "Create"}
                </Button>
            </div>
        </form>

        {/* List Existing Keys */}
        <div className="space-y-4">
             <h3 className="font-medium">Your Keys</h3>
            {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-semibold">{key.name}</p>
                        <div className="flex items-center gap-2">
                             <p className="font-mono text-sm text-muted-foreground">
                                {showKey === key.id ? key.key : `${key.key.substring(0, 8)}...`}
                             </p>
                             <button onClick={() => toggleShowKey(key.id)}><span className="sr-only">Toggle key visibility</span>{showKey === key.id ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Requests: {key.requests.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(key.key); toast({ title: "Copied!" }) }}>
                            <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Revoke this API Key?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently revoke the "{key.name}" key.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive" onClick={() => handleDeleteKey(key.id)} disabled={isDeleting === key.id}>
                                        {isDeleting === key.id ? "Revoking..." : "Revoke"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}