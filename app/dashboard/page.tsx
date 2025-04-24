"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, Clock, Film, Home, Share2, Star, Users, Play } from "lucide-react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareStats } from "@/components/share-stats"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { fetchDefaultComparison, DashboardStats } from "@/lib/fetch-dashboard-data"

// Mock stats for sample user
const mockStats = {
  primaryYear: {
    watchTime: 247,
    videosWatched: 1842,
    uniqueCreators: 312,
    topCategory: "Gaming",
    topCreator: "MKBHD",
    year: 2023,
    isComplete: true,
    topCreators: [
      { name: "MKBHD", watchTime: 42.3, videoCount: 85 },
      { name: "Linus Tech Tips", watchTime: 38.7, videoCount: 78 },
      { name: "Veritasium", watchTime: 29.5, videoCount: 60 },
      { name: "Fireship", watchTime: 24.8, videoCount: 50 },
      { name: "The Verge", watchTime: 20.1, videoCount: 45 }
    ],
    monthlyVideoCounts: [120, 150, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360],
    mostWatchedVideo: {
      title: "The Ultimate Guide to Next.js 13 App Router",
      channel: "Fireship",
      count: 14
    }
  },
  comparisonYear: {
    watchTime: 210,
    videosWatched: 1500,
    uniqueCreators: 290,
    topCategory: "Tech",
    topCreator: "Linus Tech Tips",
    year: 2022,
    isComplete: true,
    topCreators: [
      { name: "Linus Tech Tips", watchTime: 45.2, videoCount: 90 },
      { name: "MKBHD", watchTime: 35.8, videoCount: 70 },
      { name: "The Verge", watchTime: 28.3, videoCount: 55 },
      { name: "Veritasium", watchTime: 25.6, videoCount: 50 },
      { name: "Fireship", watchTime: 22.4, videoCount: 45 }
    ],
    monthlyVideoCounts: [100, 130, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340],
    mostWatchedVideo: {
      title: "The Ultimate Guide to Next.js 13 App Router",
      channel: "Fireship",
      count: 12
    }
  }
}

interface CreatorCardProps {
  creator: {
    name: string
    watchTime: number
    videoCount: number
  }
  rank: number
}

function CreatorCard({ creator, rank }: CreatorCardProps) {
  const progressValue = (creator.watchTime / 50) * 100 // Assuming 50 hours is max for now

  return (
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
          <p className="font-medium">{creator.name}</p>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{creator.watchTime.toFixed(1)} hours</span>
          </div>
        </div>
        <Progress value={progressValue} className="mt-2 h-2" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isLoggedIn, isSampleUser } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<{ primaryYear: DashboardStats; comparisonYear?: DashboardStats } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, router])

  // Fetch real data if not sample user, otherwise use mock data
  useEffect(() => {
    if (isLoggedIn) {
      if (isSampleUser) {
        setStats(mockStats)
        setIsLoading(false)
      } else {
        const fetchData = async () => {
          try {
            const data = await fetchDefaultComparison()
            setStats(data)
            console.log(data)
          } catch (error) {
            console.error("Error fetching dashboard stats:", error)
          } finally {
            setIsLoading(false)
          }
        }
        fetchData()
      }
    }
  }, [isLoggedIn, isSampleUser])

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
              <h1 className="text-3xl font-bold tracking-tight">Your YouTube Wrapped</h1>
              <p className="text-muted-foreground">
                {stats ? `Here's a summary of your YouTube activity from ${stats.primaryYear.year}${stats.comparisonYear ? ` compared to ${stats.comparisonYear.year}` : ''}.` : 'Loading your YouTube activity...'}
              </p>
            </div>


            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardTitle>Loading...</CardTitle>
                      <CardDescription>Please wait</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stats ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Watch Time</CardTitle>
                      <CardDescription>Hours spent watching videos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">Coming Soon</div>
                      <p className="text-xs text-muted-foreground">Watch time data will be available soon</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Videos Watched</CardTitle>
                      <CardDescription>Total number of videos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{stats.primaryYear.videosWatched.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">videos</p>
                      {stats.comparisonYear && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            <span className={stats.primaryYear.videosWatched > stats.comparisonYear.videosWatched ? "text-green-500" : "text-red-500"}>
                              {Math.round(((stats.primaryYear.videosWatched - stats.comparisonYear.videosWatched) / stats.comparisonYear.videosWatched) * 100)}%
                            </span>{" "}
                            compared to {stats.comparisonYear.year}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Unique Creators</CardTitle>
                      <CardDescription>Different channels you watched</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{stats.primaryYear.uniqueCreators}</div>
                      <p className="text-xs text-muted-foreground">creators</p>
                      {stats.comparisonYear && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            <span className={stats.primaryYear.uniqueCreators > stats.comparisonYear.uniqueCreators ? "text-green-500" : "text-red-500"}>
                              {Math.round(((stats.primaryYear.uniqueCreators - stats.comparisonYear.uniqueCreators) / stats.comparisonYear.uniqueCreators) * 100)}%
                            </span>{" "}
                            compared to {stats.comparisonYear.year}
                          </div>
                        </div>
                      )}
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
                              <span>{stats.primaryYear.topCategory}</span>
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
                        {stats.primaryYear.topCreators.map((creator, index) => (
                          <CreatorCard key={creator.name} creator={creator} rank={index + 1} />
                        ))}
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Hours Watched</h3>
                          <div className="h-64">
                            <Bar
                              data={{
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                datasets: [
                                  {
                                    label: 'Hours',
                                    data: [120, 150, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360],
                                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                    borderColor: 'rgb(59, 130, 246)',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    borderSkipped: false,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    title: {
                                      display: true,
                                      text: 'Hours',
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Videos Watched</h3>
                          <div className="h-64">
                            <Bar
                              data={{
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                datasets: [
                                  {
                                    label: 'Videos',
                                    // data: [120, 150, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360],
                                    data: stats?.primaryYear.monthlyVideoCounts || Array(12).fill(0),
                                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                                    borderColor: 'rgb(16, 185, 129)',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    borderSkipped: false,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    title: {
                                      display: true,
                                      text: 'Videos',
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <h2 className="mb-4 text-2xl font-bold tracking-tight">Your {stats.primaryYear.year} Highlights</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Most Watched Video</CardTitle>
                        <CardDescription>Your most rewatched video of the year</CardDescription>
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
                        <h3 className="mt-2 font-medium line-clamp-2">{stats?.primaryYear.mostWatchedVideo.title}</h3>
                        <p className="text-sm text-muted-foreground">{stats?.primaryYear.mostWatchedVideo.channel}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Play className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Watched {stats?.primaryYear.mostWatchedVideo.count} times
                          </span>
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
                          On July 15, {stats.primaryYear.year}, you had your longest YouTube marathon watching gaming content.
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
                    stats={{
                      watchTime: stats?.primaryYear.watchTime || 0,
                      videosWatched: stats?.primaryYear.videosWatched || 0,
                      topCategory: stats?.primaryYear.topCategory || "Unknown",
                      topCreator: stats?.primaryYear.topCreator || "Unknown"
                    }}
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
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
