"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, ArrowRight } from "lucide-react"

// Mock data for organizations
const organizations = [
  { id: "org1", name: "Tech Innovators Inc." },
  { id: "org2", name: "Creative Minds Collective" },
  { id: "org3", name: "Future Forward Solutions" },
  { id: "org4", name: "The Digital Pen" },
]

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userRole, setUserRole] = useState<"writer" | "organization" | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRoleSelection = (role: "writer" | "organization") => {
    setUserRole(role)
    setStep(2)
  }

  const handleWriterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate sending an approval request
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setShowSuccess(true)

    // Redirect after a short delay to show the success message
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  const handleOrgSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simulate creating the organization and connecting the website
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    router.push("/dashboard")
  }

  const cardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
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
                <CardTitle className="text-2xl">
                  Welcome to DITBlogs!
                </CardTitle>
                <CardDescription>
                  Let's get you set up. How will you be using our platform?
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-24 text-lg"
                  onClick={() => handleRoleSelection("writer")}
                >
                  I'm a Writer/Editor
                </Button>
                <Button
                  variant="outline"
                  className="h-24 text-lg"
                  onClick={() => handleRoleSelection("organization")}
                >
                  I'm an Organization
                </Button>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          )}

          {step === 2 && userRole === "writer" && (
            <Card>
              <form onSubmit={handleWriterSubmit}>
                <CardHeader>
                  <CardTitle>Join an Organization</CardTitle>
                  <CardDescription>
                    Select your organization and send an approval request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                   {showSuccess ? (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <Check className="h-16 w-16 text-green-500" />
                        </motion.div>
                        <p className="text-lg font-semibold">Request Sent!</p>
                        <p className="text-sm text-muted-foreground">
                            Your request has been sent to the organization for approval. You will be redirected shortly.
                        </p>
                    </div>
                   ) : (
                    <>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Select required>
                      <SelectTrigger id="organization">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Introduce yourself to the organization..."
                    />
                  </div>
                  </>
                  )}
                </CardContent>
                <CardFooter>
                  {!showSuccess && (
                     <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading ? "Sending..." : "Send Approval Request"}
                     <ArrowRight className="ml-2 h-4 w-4" />
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
                  <CardTitle>Setup Your Organization</CardTitle>
                  <CardDescription>
                    Tell us a bit about your organization and connect your
                    website.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      placeholder="Your Company Inc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://your-website.com"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Continue to Dashboard"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}