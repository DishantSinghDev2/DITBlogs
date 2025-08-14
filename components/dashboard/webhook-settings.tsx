// components/dashboard/webhook-settings.tsx (Create this new file)
"use client";

import { Webhook } from "@prisma/client";
import { useFormStatus } from "react-dom";
import { useRef } from "react";
import { createWebhook, deleteWebhook } from "@/lib/actions/webhook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create Webhook"}</Button>;
}

function DeleteButton({ webhookId }: { webhookId: string }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => {
                if (!confirm("Are you sure you want to delete this webhook?")) {
                    event?.preventDefault();
                }
            }}
        >
            {pending ? "Deleting..." : <TrashIcon className="h-4 w-4" />}
        </Button>
    )
}

export function WebhookSettings({
  organizationId,
  webhooks,
}: {
  organizationId: string;
  webhooks: Webhook[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-8">
        {/* Create Webhook Form */}
        <form
            ref={formRef}
            action={async (formData) => {
                try {
                    await createWebhook(formData);
                    toast.success("Webhook created successfully!");
                    formRef.current?.reset();
                } catch (e: any) {
                    toast.error(e.message);
                }
            }}
            className="flex items-center gap-4"
        >
            <Input name="url" placeholder="https://yourapp.com/api/revalidate" required />
            <input type="hidden" name="orgId" value={organizationId} />
            <SubmitButton />
        </form>

        {/* List Existing Webhooks */}
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Active Webhooks</h3>
            {webhooks.length > 0 ? (
                webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <p className="font-mono text-sm">{webhook.url}</p>
                            <p className="text-xs text-muted-foreground">Secret: <span className="font-mono bg-muted p-1 rounded">{webhook.secret}</span></p>
                        </div>
                        <form action={deleteWebhook.bind(null, webhook.id)}>
                            <DeleteButton webhookId={webhook.id}/>
                        </form>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">No webhooks configured yet.</p>
            )}
        </div>
    </div>
  );
}