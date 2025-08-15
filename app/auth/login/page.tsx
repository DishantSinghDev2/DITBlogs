"use client"

import { useState, useEffect } from "react" // Import useEffect
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react" // Import useSession
import { Loader2 } from "lucide-react" // For a better loading spinner

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession() // Get session status

  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const error = searchParams.get("error")

  // --- UX Improvement: Redirect if already logged in ---
  useEffect(() => {
    if (status === "authenticated") {
      // You can add more complex logic here based on session.user properties if needed
      router.push("/dashboard") // Or redirect to onboarding if not completed
    }
  }, [status, router])

  async function handleLogin() {
    setIsLoading(true)
    setAuthError(null)

    try {
      await signIn("wyi", {
        // The middleware will now handle the redirect logic,
        // so sending them to the dashboard is a safe default.
        callbackUrl: "/dashboard",
      })
    } catch (error) {
      setAuthError("An unexpected error occurred during login.")
    } finally {
      // The redirect should happen before this is ever called
      setIsLoading(false)
    }
  }
  
  // Render a loading state or null while session is being determined
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="container flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {(authError || error) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authError || "Login failed. Please try again."}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <Button
              className="w-full font-semibold"
              onClick={handleLogin}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Image
                  src="/wyi.png"
                  alt="WhatsYour.Info Logo"
                  width={20}
                  height={20}
                  className="mr-2"
                />
              )}
              {isLoading ? "Redirecting..." : "Sign in with WhatsYour.Info"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-center px-8">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            &{" "}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}