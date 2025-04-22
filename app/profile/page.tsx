"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Film, Mail, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const { isLoggedIn, user, logout } = useAuth()
  const router = useRouter()

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
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">YouTube Wrapped</span>
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
                  <div className="pt-2">
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
                    <div className="flex justify-end">
                    </div>
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
