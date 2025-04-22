"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, Clock, Film, Home, Share2, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { ShareStats } from "@/components/share-stats"
import { useAuth } from "@/contexts/auth-context"

// Mock stats for sharing
const userStats = {
  watchTime: 247,
  videosWatched: 1842,
  topCategory: "Gaming",
  topCreator: "MKBHD",
}

export default function DashboardPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, router])

  // If not logged in, don't render the page content
  if (!isLoggedIn) {
    return null
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
            <ShareStats stats={userStats} />
            <UserProfile />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[250px] flex-col border-r px-4 py-6 md:flex">
          <div className="flex items-center gap-2 px-2">
            <div className="h-10 w-10 rounded-full bg-muted">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Alex Johnson</p>
              <p className="text-xs text-muted-foreground">Joined 2018</p>
            </div>
          </div>
          <nav className="mt-8 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/watch-time"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-4 w-4" />
              Watch Time
            </Link>
            <Link
              href="/dashboard/categories"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Categories
            </Link>
            <Link
              href="/dashboard/creators"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              Creators
            </Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="container py-6 md:py-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Your 2023 YouTube Wrapped</h1>
              <p className="text-muted-foreground">
                Here's a summary of your YouTube activity from January 1 to December 31, 2023.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Watch Time</CardTitle>
                  <CardDescription>Hours spent watching videos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">hours</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="text-green-500 font-medium">+18%</span> compared to 2022
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Videos Watched</CardTitle>
                  <CardDescription>Total number of videos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">1,842</div>
                  <p className="text-xs text-muted-foreground">videos</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="text-green-500 font-medium">+24%</span> compared to 2022
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Unique Creators</CardTitle>
                  <CardDescription>Different channels you watched</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">312</div>
                  <p className="text-xs text-muted-foreground">creators</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="text-green-500 font-medium">+7%</span> compared to 2022
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>What you watched the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <span>Gaming</span>
                        </div>
                        <span className="text-sm font-medium">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span>Tech</span>
                        </div>
                        <span className="text-sm font-medium">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span>Music</span>
                        </div>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                      <Progress value={18} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <span>Education</span>
                        </div>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                          <span>Entertainment</span>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Creators</CardTitle>
                  <CardDescription>Channels you watched the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Creator avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">MKBHD</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">42.3 hours</span>
                          </div>
                        </div>
                        <Progress value={85} className="mt-2 h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Creator avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Linus Tech Tips</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">38.7 hours</span>
                          </div>
                        </div>
                        <Progress value={78} className="mt-2 h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Creator avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Veritasium</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">29.5 hours</span>
                          </div>
                        </div>
                        <Progress value={60} className="mt-2 h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted">
                        <Image
                          src="/placeholder.svg?height=40&width=40"
                          alt="Creator avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Fireship</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">24.8 hours</span>
                          </div>
                        </div>
                        <Progress value={50} className="mt-2 h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Watch Time</CardTitle>
                  <CardDescription>How your viewing changed throughout the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="hours">
                    <TabsList className="mb-4">
                      <TabsTrigger value="hours">Hours</TabsTrigger>
                      <TabsTrigger value="videos">Videos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="hours">
                      <div className="h-[300px]">
                        <div className="flex h-full items-end gap-2">
                          {[18, 22, 25, 20, 28, 32, 35, 40, 38, 30, 25, 22].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-red-600 to-red-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 40) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value} hours
                                </div>
                              </div>
                              <div className="mt-2 text-center text-xs text-muted-foreground">
                                {
                                  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                                    index
                                  ]
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="videos">
                      <div className="h-[300px]">
                        <div className="flex h-full items-end gap-2">
                          {[120, 145, 160, 130, 170, 190, 210, 230, 200, 180, 150, 140].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 230) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value} videos
                                </div>
                              </div>
                              <div className="mt-2 text-center text-xs text-muted-foreground">
                                {
                                  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
                                    index
                                  ]
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Your 2023 Highlights</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Most Watched Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                      <Image
                        src="/placeholder.svg?height=180&width=320"
                        alt="Video thumbnail"
                        width={320}
                        height={180}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="mt-2 font-medium line-clamp-2">The Ultimate Guide to Next.js 13 App Router</h3>
                    <p className="text-sm text-muted-foreground">Fireship</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Watched 14 times</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Longest Watching Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">5.2</div>
                    <p className="text-sm text-muted-foreground">hours straight</p>
                    <p className="mt-2 text-sm">
                      On July 15, 2023, you had your longest YouTube marathon watching gaming content.
                    </p>
                    <div className="mt-4 rounded-md bg-muted p-2 text-sm">
                      <p className="font-medium">Top video from this session:</p>
                      <p className="line-clamp-2">Minecraft Hardcore Survival: Day 1000</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Most Active Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">9PM - 11PM</div>
                    <p className="text-sm text-muted-foreground">evening viewer</p>
                    <div className="mt-4 h-16">
                      <div className="flex h-full items-end gap-1">
                        {[
                          10, 5, 8, 15, 25, 30, 45, 60, 75, 90, 85, 70, 60, 50, 65, 80, 90, 95, 100, 90, 75, 60, 40, 20,
                        ].map((value, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t bg-gradient-to-t from-purple-600 to-purple-400"
                            style={{ height: `${value}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>12AM</span>
                      <span>6AM</span>
                      <span>12PM</span>
                      <span>6PM</span>
                      <span>12AM</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-12 text-center">
              <ShareStats
                stats={userStats}
                iconOnly={false}
                trigger={
                  <Button size="lg" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share My YouTube Wrapped
                  </Button>
                }
              />
              <p className="mt-2 text-sm text-muted-foreground">Generate a shareable image to post on social media</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
