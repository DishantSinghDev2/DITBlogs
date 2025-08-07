"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ArrowRight, PenSquare, Users, Loader2, Mail, XIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
}


type OnboardingView = 'loading' | 'invitation' | 'selection' | 'joinForm' | 'createForm';


export default function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { update } = useSession();

  const [view, setView] = useState<OnboardingView>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgResponse, inviteResponse] = await Promise.all([
          fetch("/api/organizations"),
          fetch('/api/user/invitations'),
        ]);

        const orgs = await orgResponse.json();
        const invites = await inviteResponse.json();

        setOrganizations(orgs);
        setInvitations(invites);

        // Logic to determine the initial view
        const stepParam = searchParams.get('step');
        if (stepParam === 'join') {
          setView('joinForm');
        } else if (stepParam === 'create') {
          setView('createForm');
        } else if (invites && invites.length > 0) {
          setView('invitation');
        } else {
          setView('selection');
        }
      } catch (err) {
        setError("Could not load initial data. Please refresh.");
        setView('selection'); // Default to selection on error
      }
    };
    fetchData();
  }, [searchParams]);

  const handleInviteResponse = async (inviteId: string, action: 'accept' | 'decline') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invites/${inviteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} invite.`);

      toast({ title: `Invitation ${action}ed!` });

      if (action === 'accept') {
        await update(); // Critical step to refresh session
        router.push('/dashboard');
      } else {
        // Remove the invitation from the view and show the selection screen
        setInvitations(invs => invs.filter(inv => inv.id !== inviteId));
        setView('selection');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const message = formData.get("message") as string;

    try {
      const response = await fetch('/api/onboarding/request-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: selectedOrg, message }),
      });

      if (!response.ok) throw new Error('Failed to send request.');

      // FIX: Manually trigger a session update
      await update();

      setShowSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrgSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const orgName = formData.get("orgName") as string;
    const website = formData.get("website") as string;

    try {
      const response = await fetch('/api/onboarding/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, website }),
      });

      if (!response.ok) throw new Error('Failed to create organization.');

      // FIX: Manually trigger a session update
      await update();

      // Now that the session is updated, the redirect will work.
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const RoleCard = ({ icon, title, description, onClick }: any) => (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-all hover:border-primary hover:shadow-md"
    >
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );

  if (view === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center bg-white dark:bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* --- INVITATION VIEW --- */}
          {view === 'invitation' && invitations.length > 0 && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl">You're Invited!</CardTitle>
                <CardDescription>
                  You have been invited to join the <strong>{invitations[0].organization.name}</strong> organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">Accepting will automatically set up your account and take you to the dashboard.</p>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleInviteResponse(invitations[0].id, 'decline')} disabled={isLoading}>
                  <XIcon className="mr-2 h-4 w-4" /> Decline
                </Button>
                <Button onClick={() => handleInviteResponse(invitations[0].id, 'accept')} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Accept Invite
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* --- ROLE SELECTION VIEW --- */}
          {view === 'selection' && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to DITBlogs!</CardTitle>
                <CardDescription>How will you be using the platform?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RoleCard icon={<PenSquare />} title="I'm a Writer or Editor" description="Join an existing organization." onClick={() => setView('joinForm')} />
                <RoleCard icon={<Users />} title="I'm setting up an Organization" description="Create a new workspace for your team." onClick={() => setView('createForm')} />
              </CardContent>
            </Card>
          )}

          {/* --- JOIN ORGANIZATION FORM --- */}
          {view === 'joinForm' && (
            <Card>
              <form onSubmit={handleWriterSubmit}>
                <CardHeader>
                  <CardTitle>Join an Organization</CardTitle>
                  <CardDescription>Select your organization to send an approval request.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                  {showSuccess ? (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                        <Check className="h-16 w-16 text-green-500" />
                      </motion.div>
                      <p className="text-lg font-semibold">Request Sent!</p>
                      <p className="text-sm text-muted-foreground">You will be redirected once your request is approved.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Select required onValueChange={setSelectedOrg} value={selectedOrg}>
                          <SelectTrigger id="organization">
                            <SelectValue placeholder="Select an organization" />
                          </SelectTrigger>
                          <SelectContent>
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea id="message" name="message" placeholder="Introduce yourself to the organization..." />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  {!showSuccess && (
                    <Button type="submit" className="w-full" disabled={isLoading || !selectedOrg}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                      {isLoading ? "Sending..." : "Send Approval Request"}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          )}
          {/* --- CREATE ORGANIZATION FORM --- */}
          {view === 'createForm' && (
            <Card>
              <form onSubmit={handleOrgSubmit}>
                <CardHeader>
                  <CardTitle>Set Up Your Organization</CardTitle>
                  <CardDescription>Tell us about your organization to create your workspace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" name="orgName" placeholder="Your Company Inc." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input id="website" name="website" type="url" placeholder="https://your-website.com" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    {isLoading ? "Saving..." : "Continue to Dashboard"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}