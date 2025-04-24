"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, Clock, Film, Home, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"

// Mock stats for sharing
const userStats = {
  watchTime: 247,
  videosWatched: 1842,
  topCategory: "Gaming",
  topCreator: "MKBHD",
}

export default function CategoriesPage() {
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
      <DashboardHeader />
      <div className="flex flex-1">
        <aside className="hidden w-[250px] flex-col border-r px-4 py-6 md:flex">
          <nav className="mt-8 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
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
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium"
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
              <h1 className="text-3xl font-bold tracking-tight">Category Analysis</h1>
              <p className="text-muted-foreground">Breakdown of the types of content you watched in 2023.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Percentage of watch time by category</CardDescription>
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
                      <div className="text-xs text-muted-foreground">79 hours</div>
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
                      <div className="text-xs text-muted-foreground">69 hours</div>
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
                      <div className="text-xs text-muted-foreground">44 hours</div>
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
                      <div className="text-xs text-muted-foreground">30 hours</div>
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
                      <div className="text-xs text-muted-foreground">25 hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Comparison</CardTitle>
                  <CardDescription>How your interests changed from 2022</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Gaming</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-500">+8%</span>
                          <span className="text-sm">from 24% in 2022</span>
                        </div>
                      </div>
                      <div className="flex h-2 w-full items-center gap-1">
                        <div className="h-full w-[24%] rounded-l-full bg-muted"></div>
                        <div className="h-full w-[8%] rounded-r-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Tech</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-500">+3%</span>
                          <span className="text-sm">from 25% in 2022</span>
                        </div>
                      </div>
                      <div className="flex h-2 w-full items-center gap-1">
                        <div className="h-full w-[25%] rounded-l-full bg-muted"></div>
                        <div className="h-full w-[3%] rounded-r-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Music</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-500">-2%</span>
                          <span className="text-sm">from 20% in 2022</span>
                        </div>
                      </div>
                      <div className="flex h-2 w-full items-center gap-1">
                        <div className="h-full w-[18%] rounded-l-full bg-muted"></div>
                        <div className="h-full w-[2%] rounded-r-full bg-red-500"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Education</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-500">+4%</span>
                          <span className="text-sm">from 8% in 2022</span>
                        </div>
                      </div>
                      <div className="flex h-2 w-full items-center gap-1">
                        <div className="h-full w-[8%] rounded-l-full bg-muted"></div>
                        <div className="h-full w-[4%] rounded-r-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Entertainment</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-500">-13%</span>
                          <span className="text-sm">from 23% in 2022</span>
                        </div>
                      </div>
                      <div className="flex h-2 w-full items-center gap-1">
                        <div className="h-full w-[10%] rounded-l-full bg-muted"></div>
                        <div className="h-full w-[13%] rounded-r-full bg-red-500"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Category Trends</CardTitle>
                  <CardDescription>How your interests changed throughout the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="gaming">
                    <TabsList className="mb-4">
                      <TabsTrigger value="gaming">Gaming</TabsTrigger>
                      <TabsTrigger value="tech">Tech</TabsTrigger>
                      <TabsTrigger value="music">Music</TabsTrigger>
                      <TabsTrigger value="education">Education</TabsTrigger>
                    </TabsList>
                    <TabsContent value="gaming">
                      <div className="h-[250px]">
                        <div className="flex h-full items-end gap-2">
                          {[25, 28, 30, 25, 35, 40, 45, 50, 42, 38, 35, 32].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-red-600 to-red-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 50) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value}%
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
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <h3 className="font-medium">Gaming Insights</h3>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                            <span>Your gaming viewership peaked in August at 50% of your total watch time</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                            <span>Most watched gaming content: Minecraft, Fortnite, and League of Legends</span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="tech">
                      <div className="h-[250px]">
                        <div className="flex h-full items-end gap-2">
                          {[30, 32, 35, 30, 25, 22, 20, 25, 30, 35, 38, 40].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 40) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value}%
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
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <h3 className="font-medium">Tech Insights</h3>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            <span>Your tech viewership increased significantly in the last quarter</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            <span>Most watched tech content: smartphone reviews, coding tutorials, and AI news</span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="music">
                      <div className="h-[250px]">
                        <div className="flex h-full items-end gap-2">
                          {[15, 18, 20, 25, 30, 25, 20, 15, 12, 15, 18, 20].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-green-600 to-green-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 30) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value}%
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
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <h3 className="font-medium">Music Insights</h3>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                            <span>Your music viewership peaked in May at 30% of your total watch time</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                            <span>
                              Most watched music content: pop music videos, live performances, and music reviews
                            </span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="education">
                      <div className="h-[250px]">
                        <div className="flex h-full items-end gap-2">
                          {[8, 10, 12, 15, 10, 8, 10, 12, 15, 18, 20, 22].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 22) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value}%
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
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <h3 className="font-medium">Education Insights</h3>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                            <span>
                              Your educational content viewership has been steadily increasing throughout the year
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                            <span>
                              Most watched educational content: programming tutorials, science explainers, and history
                              documentaries
                            </span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Gaming Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-28 overflow-hidden rounded-md bg-muted">
                        <Image
                          src="/placeholder.svg?height=64&width=112"
                          alt="Video thumbnail"
                          width={112}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-2">Minecraft Hardcore Survival: Day 1000</p>
                        <p className="text-xs text-muted-foreground">PewDiePie</p>
                        <p className="text-xs text-muted-foreground">Watched 14 times</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-28 overflow-hidden rounded-md bg-muted">
                        <Image
                          src="/placeholder.svg?height=64&width=112"
                          alt="Video thumbnail"
                          width={112}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-2">Fortnite Chapter 4 Season 2: Gameplay</p>
                        <p className="text-xs text-muted-foreground">Ninja</p>
                        <p className="text-xs text-muted-foreground">Watched 9 times</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-28 overflow-hidden rounded-md bg-muted">
                        <Image
                          src="/placeholder.svg?height=64&width=112"
                          alt="Video thumbnail"
                          width={112}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-2">League of Legends: Pro Tips and Tricks</p>
                        <p className="text-xs text-muted-foreground">Faker</p>
                        <p className="text-xs text-muted-foreground">Watched 7 times</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Tech Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-28 overflow-hidden rounded-md bg-muted">
                        <Image
                          src="/placeholder.svg?height=64&width=112"
                          alt="Video thumbnail"
                          width={112}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-2">iPhone 15 Pro: Honest Review</p>
                        <p className="text-xs text-muted-foreground">MKBHD</p>
                        <p className="text-xs text-muted-foreground">Watched 11 times</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-28 overflow-hidden rounded-md bg-muted">
                        <Image
                          src="/placeholder.svg?height=64&width=112"
                          alt="Video thumbnail"
                          width={112}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-2">The Ultimate Guide to Next.js 13 App Router</p>
                        <p className="text-xs text-muted-foreground">Fireship</p>
                        <p className="text-xs text-muted-foreground">Watched 8 times</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-28 overflow-hidden rounded-md bg-muted">
                        <Image
                          src="/placeholder.svg?height=64&width=112"
                          alt="Video thumbnail"
                          width={112}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-2">Building a $5000 Gaming PC</p>
                        <p className="text-xs text-muted-foreground">Linus Tech Tips</p>
                        <p className="text-xs text-muted-foreground">Watched 6 times</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Category Discoveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <h3 className="font-medium">New Categories</h3>
                      </div>
                      <p className="mt-2 text-sm">
                        In 2023, you started watching these categories that you rarely watched before:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
                          <span>Cooking (3% of watch time)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
                          <span>Travel (2% of watch time)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
                          <span>Finance (1% of watch time)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <h3 className="font-medium">Category Diversity</h3>
                      </div>
                      <p className="mt-2 text-sm">
                        Your content diversity score is <span className="font-medium">72/100</span>, which means you
                        watch a good variety of content across different categories.
                      </p>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/20">
                        <div className="h-full w-[72%] rounded-full bg-yellow-500"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
