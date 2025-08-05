"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Check for custom error messages from NextAuth.js callback
  const error = searchParams.get("error")

  // Handle OAuth login
  async function handleLogin() {
    setIsLoading(true)
    setAuthError(null)

    try {
      // The provider ID 'whatsyourinfo' must match the one in your authOptions
      await signIn("wyi", {
        callbackUrl: "/dashboard",
      })
    } catch (error) {
      setAuthError("An unexpected error occurred during login.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display a generic error or a specific one from the URL */}
          {(authError || error) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authError || "Login failed. Please try again."}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                "Redirecting..."
              ) : (
                <>
                  <Image
                    src="/wyi.png" // Ensure wyi.png is in your /public folder
                    alt="WhatsYour.Info Logo"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Sign in with WhatsYour.Info
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
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