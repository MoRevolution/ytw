"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Film, Mail, MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { processAndStoreWatchHistoryByYear } from "@/lib/process-watch-history"

export default function ProfilePage() {
  const { isLoggedIn, user, logout } = useAuth()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  // If not logged in, don't render the page content
  if (!isLoggedIn) {
    return null
  }

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      // Get the user's ID token
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("No authenticated user found");
      }

      const response = await fetch('/api/users/get-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch watch history: ${response.status}`);
      }

      const { data } = await response.json();
      
      if (!data) {
        throw new Error("No watch history data available");
      }

      // Process and store the watch history data
      await processAndStoreWatchHistoryByYear(data);

      toast({
        title: "Data refreshed",
        description: "Your YouTube watch history has been successfully updated and processed.",
      });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      toast({
        title: "Error",
        description: "Could not refresh watch history. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false)
    }
  }

  // Mock stats data
  const userStats = {
    watchTime: 247,
    videosWatched: 1842,
    uniqueCreators: 312,
    topCategory: "Gaming",
    topCreator: "MKBHD",
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">YouTube Wrapped</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6 md:py-12">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="relative h-32 w-32">
                    <Image
                      src={user?.photoURL || "/placeholder.svg"}
                      alt={user?.displayName || "User"}
                      width={128}
                      height={128}
                      className="rounded-full border-4 border-background"
                    />
                  </div>
                  <CardTitle className="mt-4">{user?.displayName || "User"}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user?.email || "user@example.com"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined 2018</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleRefreshData}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Data
                        </>
                      )}
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={logout}>
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your YouTube Stats</CardTitle>
                  <CardDescription>Summary of your YouTube activity in 2023</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-muted p-4 text-center">
                      <Clock className="mx-auto h-6 w-6 text-primary" />
                      <p className="mt-2 text-2xl font-bold">{userStats.watchTime}</p>
                      <p className="text-sm text-muted-foreground">Hours Watched</p>
                    </div>
                    <div className="rounded-lg bg-muted p-4 text-center">
                      <Film className="mx-auto h-6 w-6 text-primary" />
                      <p className="mt-2 text-2xl font-bold">{userStats.videosWatched}</p>
                      <p className="text-sm text-muted-foreground">Videos Watched</p>
                    </div>
                    <div className="rounded-lg bg-muted p-4 text-center">
                      <Calendar className="mx-auto h-6 w-6 text-primary" />
                      <p className="mt-2 text-2xl font-bold">{userStats.uniqueCreators}</p>
                      <p className="text-sm text-muted-foreground">Unique Creators</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is only used to generate your YouTube Wrapped insights. We don't share your viewing
                      history with third parties.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
