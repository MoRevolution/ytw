"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Film, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { GoogleLogin } from "@/components/google-login"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasUsers, setHasUsers] = useState(false)
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  // Check users collection on component mount
  useEffect(() => {
    const checkUsers = async () => {
      try {
        const response = await fetch('/api/check-users');
        const data = await response.json();
        setHasUsers(data.exists);
        console.log('Users collection exists:', data.exists);
      } catch (error) {
        console.error('Error checking users collection:', error);
      }
    };

    checkUsers();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

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
        <Link href="/" className="flex items-center gap-2">
          <Film className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">YouTube Wrapped</span>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            {!hasUsers && "Welcome to YouTube Wrapped! You'll be one of our first users."}
            {hasUsers && "Sign in to access your YouTube Wrapped insights"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 p-4 text-sm text-yellow-800 dark:text-yellow-200">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Psst! Before you dive in... 🎬</p>
                <p className="mt-1">You'll need your YouTube watch history to get your Wrapped! Don't worry, it's super easy - just follow our <a href="/takeout-instructions" className="text-yellow-700 dark:text-yellow-300 underline hover:text-yellow-800 dark:hover:text-yellow-200">quick guide</a> to get your data.</p>
              </div>
            </div>
          </div>
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
                  We use Google Sign In to securely access your YouTube watch history from Google Drive. 
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
                      <span>Google Drive access to fetch your YouTube watch history</span>
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
            <Link href="/terms-and-privacy" className="underline hover:text-foreground">
              Terms of Service and Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
