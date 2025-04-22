"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Film, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { GoogleLogin } from "@/components/google-login"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  // Redirect if already logged in
  if (isLoggedIn) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link
        href="/"
        className="absolute left-8 top-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="mb-8 flex items-center gap-2">
        <Film className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">YouTube Wrapped</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>Sign in to access your YouTube Wrapped insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4 space-y-4">
              <div className="flex flex-col space-y-2">
                <GoogleLogin variant="login" />
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Why Google Sign In?</span>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  We use Google Sign In to securely access your YouTube watch history and provide personalized insights.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="signup" className="mt-4 space-y-4">
              <div className="flex flex-col space-y-2">
                <GoogleLogin variant="signup" />
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Required Permissions</span>
                  </div>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <h3 className="text-sm font-medium">We'll request access to:</h3>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1 w-1 rounded-full bg-primary"></div>
                      <span>Your Google account profile information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1 w-1 rounded-full bg-primary"></div>
                      <span>Read-only access to your YouTube watch history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1 w-1 rounded-full bg-primary"></div>
                      <span>Google Drive access to store your Wrapped data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
