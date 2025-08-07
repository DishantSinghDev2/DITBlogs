"use client";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";

export function InvitationPopup({ invite }: { invite: any }) {
    const router = useRouter();
    const handleResponse = async (action: 'accept' | 'decline') => {
        await fetch(`/api/invites/${invite.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ action }),
        });
        toast({ title: `Invite ${action}ed!` });
        router.refresh(); // This will reload server components and remove the popup
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 shadow-lg">
                <CardHeader>
                    <CardTitle>You're Invited!</CardTitle>
                    <CardDescription>
                        You have been invited to join the <strong>{invite.organization.name}</strong> organization.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleResponse('decline')}>Decline</Button>
                    <Button onClick={() => handleResponse('accept')}>Accept</Button>
                </CardFooter>
            </Card>
        </div>
    );
}