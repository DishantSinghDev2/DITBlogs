"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, X as XIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function InvitationDashboard({ invite }: { invite: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const { update } = useSession(); // To refresh the token after accepting
  const [isLoading, setIsLoading] = useState<false | 'accept' | 'decline'>(false);

  const handleResponse = async (action: 'accept' | 'decline') => {
    setIsLoading(action);
    try {
      const response = await fetch(`/api/invites/${invite.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error(`Failed to ${action} invite.`);
      
      if (action === 'accept') {
        toast({ title: "Welcome to the Team!", description: "You are now a member of the organization." });
        await update(); // Update session token
        router.push('/dashboard'); // Go to the full dashboard
        router.refresh();
      } else {
        toast({ title: "Invitation Declined" });
        router.refresh(); // Refresh to remove the invite
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
            </div>
          <CardTitle className="mt-4 text-2xl">You Have an Invitation</CardTitle>
          <CardDescription>
            You've been invited to join the <strong>{invite.organization.name}</strong> organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                By accepting, you will become a member of this organization and will be able to contribute content.
            </p>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => handleResponse('decline')} disabled={!!isLoading}>
            {isLoading === 'decline' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XIcon className="mr-2 h-4 w-4" />}
            Decline
          </Button>
          <Button onClick={() => handleResponse('accept')} disabled={!!isLoading}>
             {isLoading === 'accept' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
            Accept Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}