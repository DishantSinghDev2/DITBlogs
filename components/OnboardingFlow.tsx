"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ArrowRight, PenSquare, Users, Loader2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<"writer" | "organization" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  // Fetch organizations when the component loads
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch("/api/organizations");
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        setError("Could not load organizations. Please refresh the page.");
      }
    };
    fetchOrgs();
  }, []);

  const handleRoleSelection = (role: "writer" | "organization") => {
    setUserRole(role);
    setStep(2);
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

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to send request.');
        }

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

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create organization.');
        }
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

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center bg-white dark:bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {step === 1 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to DITBlogs!</CardTitle>
                <CardDescription>
                  To get started, tell us how you'll be using the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RoleCard
                    icon={<PenSquare className="h-8 w-8 text-primary" />}
                    title="I'm a Writer or Editor"
                    description="Join an existing organization to contribute content."
                    onClick={() => handleRoleSelection("writer")}
                />
                <RoleCard
                    icon={<Users className="h-8 w-8 text-primary" />}
                    title="I'm setting up an Organization"
                    description="Create a new workspace for your team and connect your website."
                    onClick={() => handleRoleSelection("organization")}
                />
              </CardContent>
            </Card>
          )}

          {step === 2 && userRole === "writer" && (
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

          {step === 2 && userRole === "organization" && (
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