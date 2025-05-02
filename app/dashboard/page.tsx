"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, Clock, Film, Home, Share2, Star, Users, Play, GitCompare } from "lucide-react"
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
import { ShareStats } from "@/components/share-stats"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { fetchDefaultComparison, DashboardStats, CategoryStats } from "@/lib/fetch-dashboard-data"
import { getChannelThumbnailCached } from "@/lib/youtube-api"
import { WordCloudComponent } from "@/components/word-cloud"
import { CreatorCard } from "@/components/creator-card"

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
      { name: "MKBHD", watchTime: 42.3, videoCount: 85, channelId: "UCBJycsmduvYEL83R_U4JriQ" },
      { name: "Linus Tech Tips", watchTime: 38.7, videoCount: 78, channelId: "UCXuqSBlHAE6Xw-yeJA0Tunw" },
      { name: "Veritasium", watchTime: 29.5, videoCount: 60, channelId: "UCHnyfMqiRRG1u-2MsSQLbXA" },
      { name: "Fireship", watchTime: 24.8, videoCount: 50, channelId: "UCsBjURrPoezykLs9EqgamOA" },
      { name: "The Verge", watchTime: 20.1, videoCount: 45, channelId: "UCddiUEpeqJcYeBxXxIVlKCA" }
    ],
    monthlyVideoCounts: [120, 150, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360],
    monthlyWatchTime: [12.5, 15.2, 18.7, 20.3, 22.1, 24.5, 26.8, 28.9, 30.2, 32.4, 34.7, 36.9],
    categoryStats: [
      { name: "Gaming", watchTime: 65.2, percentage: 32.5 },
      { name: "Tech", watchTime: 56.8, percentage: 28.4 },
      { name: "Music", watchTime: 36.0, percentage: 18.0 },
      { name: "Education", watchTime: 24.0, percentage: 12.0 },
      { name: "Entertainment", watchTime: 20.0, percentage: 10.0 }
    ],
    mostWatchedVideos: [
      {
        title: "These new computers are getting creepy… Copilot+ PC first look",
        channel: "Fireship",
        count: 12,
        videoId: "hlwcZpEx2IY"
      },
      {
        title: "iPhone 16/16 Pro Review: Times Have Changed!",
        channel: "MKBHD",
        count: 7,
        videoId: "MRtg6A1f2Ko"
      },
      {
        title: "What 'Follow Your Dreams' Misses | Harvey Mudd Commencement Speech 2024",
        channel: "3blue1brown",
        count: 5,
        videoId: "W3I3kAg2J7w"
      },
      {
        title: "Pro Climber pretends to be Old Man and tries all the hardest routes",
        channel: "Magnus Midtbø",
        count: 4,
        videoId: "I0ukVL0H4fs"
      },
      {
        title: "Turning children's glue into drinkable alcohol",
        channel: "NileRed",
        count: 3,
        videoId: "QzP3vx8XadU"
      }
    ],
    longestSession: {
      duration: 4.5,
      date: "2023-07-15T14:30:00Z",
      category: "Gaming",
      videos: [
        {
          title: "Minecraft Speedrun World Record",
          channel: "Dream",
          videoId: "dQw4w9WgXcQ",
          likeCount: 1500000,
          duration: "1:23:45"
        },
        {
          title: "Minecraft Building Tips and Tricks",
          channel: "Grian",
          videoId: "dQw4w9WgXcQ",
          likeCount: 800000,
          duration: "45:30"
        },
        {
          title: "Minecraft Redstone Tutorial",
          channel: "Mumbo Jumbo",
          videoId: "dQw4w9WgXcQ",
          likeCount: 600000,
          duration: "1:15:20"
        }
      ]
    },
    tags: [
      "gaming",
      "tech",
      "tutorial",
      "review",
      "news",
      "music",
      "vlog",
      "coding",
      "react",
      "javascript",
      "python",
      "ai",
      "machine learning",
      "web development"
    ]
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
      { name: "Linus Tech Tips", watchTime: 45.2, videoCount: 90, channelId: "UCXuqSBlHAE6Xw-yeJA0Tunw" },
      { name: "MKBHD", watchTime: 35.8, videoCount: 70, channelId: "UCBJycsmduvYEL83R_U4JriQ" },
      { name: "The Verge", watchTime: 28.3, videoCount: 55, channelId: "UCddiUEpeqJcYeBxXxIVlKCA" },
      { name: "Veritasium", watchTime: 25.6, videoCount: 50, channelId: "UCHnyfMqiRRG1u-2MsSQLbXA" },
      { name: "Fireship", watchTime: 22.4, videoCount: 45, channelId: "UCsBjURrPoezykLs9EqgamOA" }
    ],
    monthlyVideoCounts: [100, 130, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340],
    monthlyWatchTime: [10.2, 13.5, 16.8, 18.2, 20.1, 22.4, 24.7, 26.8, 28.9, 30.2, 32.4, 34.6],
    categoryStats: [
      { name: "Tech", watchTime: 58.8, percentage: 28.0 },
      { name: "Gaming", watchTime: 52.5, percentage: 25.0 },
      { name: "Music", watchTime: 42.0, percentage: 20.0 },
      { name: "Education", watchTime: 31.5, percentage: 15.0 },
      { name: "Entertainment", watchTime: 25.2, percentage: 12.0 }
    ],
    mostWatchedVideos: [
      {
        title: "These new computers are getting creepy… Copilot+ PC first look",
        channel: "Fireship",
        count: 12,
        videoId: "hlwcZpEx2IY"
      },
      {
        title: "iPhone 16/16 Pro Review: Times Have Changed!",
        channel: "MKBHD",
        count: 7,
        videoId: "MRtg6A1f2Ko"
      },
      {
        title: "What 'Follow Your Dreams' Misses | Harvey Mudd Commencement Speech 2024",
        channel: "3blue1brown",
        count: 5,
        videoId: "W3I3kAg2J7w"
      },
      {
        title: "Pro Climber pretends to be Old Man and tries all the hardest routes",
        channel: "Magnus Midtbø",
        count: 4,
        videoId: "I0ukVL0H4fs"
      },
      {
        title: "Turning children's glue into drinkable alcohol",
        channel: "NileRed",
        count: 3,
        videoId: "QzP3vx8XadU"
      }
    ],
    tags: [
      "tech",
      "gaming",
      "music",
      "education",
      "entertainment",
      "tutorial",
      "review",
      "news",
      "vlog",
      "coding"
    ]
  }
}

export default function DashboardPage() {
  const { isLoggedIn, isSampleUser } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<{ primaryYear: DashboardStats; comparisonYear?: DashboardStats } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(false)

  // Redirect if not logged in, but only after initial load
  useEffect(() => {
    if (!isLoggedIn && !isLoading) {
      router.push("/")
    }
  }, [isLoggedIn, router, isLoading])

  // Fetch real data if not sample user, otherwise use mock data
  useEffect(() => {
    if (isLoggedIn) {
      if (isSampleUser) {
        setStats(mockStats)
        setIsLoading(false)
      } else {
        const fetchData = async () => {
          try {
            // Check if we're in the browser environment
            // Check if we have cached data
            const cachedData = localStorage.getItem('dashboardStats')
            const cachedTimestamp = localStorage.getItem('dashboardStatsTimestamp')
            const now = new Date().getTime()
            
            // If we have cached data less than 1 hour old, use it
            if (cachedData && cachedTimestamp) {
              try {
                const parsedData = JSON.parse(cachedData)
                if ((now - parseInt(cachedTimestamp)) < 3600000) {
                  console.log('📊 Using cached dashboard stats')
                  setStats(parsedData)
                  setIsLoading(false)
                  return
                }
              } catch (parseError) {
                console.error('❌ Error parsing cached data:', parseError)
                console.error('Cached data:', cachedData)
                // Clear invalid cached data
                localStorage.removeItem('dashboardStats')
                localStorage.removeItem('dashboardStatsTimestamp')
              }
            }

            // Otherwise fetch new data
            console.log('🔄 Fetching new dashboard stats...')
            const data = await fetchDefaultComparison()
            
            try {
              // Test the data before setting it
              const testString = JSON.stringify(data)
              const testParse = JSON.parse(testString)
              console.log('✅ Data validation successful')
              
              setStats(data)
              
              // Cache the new data if we're in the browser
              localStorage.setItem('dashboardStats', testString)
              localStorage.setItem('dashboardStatsTimestamp', new Date().getTime().toString())
            } catch (validationError) {
              console.error('❌ Error validating new data:', validationError)
              console.error('Problematic data:', data)
              throw validationError
            }
          } catch (error) {
            console.error("❌ Error in fetchData:", error)
            // If we have mock stats, use them as fallback
            if (mockStats) {
              console.log('⚠️ Using mock stats as fallback')
              setStats(mockStats)
              // Show error message to user
              alert('⚠️ There was an error loading your YouTube data. Showing sample data instead. Please try refreshing the page.')
            }
          } finally {
            setIsLoading(false)
          }
        }
        fetchData()
      }
    } else {
      setIsLoading(false)
    }
  }, [isLoggedIn, isSampleUser])

  // If not logged in and not loading, don't render the page content
  if (!isLoggedIn && !isLoading) {
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
                      <div className="text-4xl font-bold">{stats?.primaryYear.watchTime.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">hours</p>
                      {stats?.comparisonYear && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            <span className={stats.primaryYear.watchTime > stats.comparisonYear.watchTime ? "text-green-500" : "text-red-500"}>
                              {Math.round(((stats.primaryYear.watchTime - stats.comparisonYear.watchTime) / stats.comparisonYear.watchTime) * 100)}%
                            </span>{" "}
                            compared to {stats.comparisonYear.year}
                          </div>
                        </div>
                      )}
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
                
                <div className="mt-8">
                  {/* <h2 className="mb-4 text-2xl font-bold tracking-tight">Your {stats.primaryYear.year} Highlights</h2> */}
                  <div className="grid gap-4 w-full mx-auto">
                    <Card className="w-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Your faves</CardTitle>
                        <div className="py-1"></div>
                      </CardHeader>
                      <CardContent>
                      <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth">
                        {stats?.primaryYear.mostWatchedVideos?.map((video) => (
                            <a 
                              key={video.videoId}
                              href={`https://www.youtube.com/watch?v=${video.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block min-w-[200px]"
                            >
                              <div className="aspect-video overflow-hidden rounded-md bg-muted group relative">
                                <Image
                                  src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                                  alt="Video thumbnail"
                                  width={200}
                                  height={112}
                                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `/placeholder.svg?height=112&width=200`;
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="bg-black/50 rounded-full p-2">
                                    <Play className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                              </div>
                              <h3 className="mt-2 text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                                {video.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">{video.channel}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <Play className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Watched {video.count} times
                                </span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Categories</CardTitle>
                      <CardDescription>What you watched the most</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats?.primaryYear?.categoryStats?.slice(0, 6).map((category: CategoryStats, index: number) => (
                          <div key={category.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{
                                  backgroundColor: `hsl(${index * 30}, 70%, 50%)`
                                }} />
                                <span>{category.name}</span>
                              </div>
                              <span className="text-sm font-medium">{category.percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={category.percentage} className="h-2" />
                          </div>
                        ))}
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
                        {(() => {
                          // Find the maximum watch time among current year's top creators
                          const maxWatchTime = Math.max(
                            ...stats.primaryYear.topCreators.map(c => c.watchTime)
                          )
                          
                          return stats.primaryYear.topCreators.map((creator, index) => {
                            const comparisonCreator = stats.comparisonYear?.topCreators.find(
                              c => c.name === creator.name
                            )
                            return (
                              <CreatorCard 
                                key={creator.name} 
                                creator={creator} 
                                rank={index + 1}
                                comparisonCreator={comparisonCreator}
                                maxWatchTime={maxWatchTime}
                              />
                            )
                          })
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Monthly Watch Time</CardTitle>
                          <CardDescription>How your viewing changed throughout the year</CardDescription>
                        </div>
                        {stats?.comparisonYear && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowComparison(!showComparison)}
                            className="gap-2"
                          >
                            <GitCompare className="h-4 w-4" />
                            {showComparison ? 'Hide Comparison' : 'Show Comparison'}
                          </Button>
                        )}
                      </div>
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
                                    label: `${stats?.comparisonYear?.year || 'Previous Year'} Hours`,
                                    data: stats?.comparisonYear?.monthlyWatchTime || Array(12).fill(0),
                                    backgroundColor: 'rgba(156, 163, 175, 0.3)',
                                    borderColor: 'rgb(156, 163, 175)',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    borderSkipped: false,
                                    hidden: !showComparison,
                                  },
                                  {
                                    label: `${stats?.primaryYear.year} Hours`,
                                    data: stats?.primaryYear.monthlyWatchTime || Array(12).fill(0),
                                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
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
                                plugins: {
                                  legend: {
                                    position: 'top' as const,
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
                                    label: `${stats?.comparisonYear?.year || 'Previous Year'} Videos`,
                                    data: stats?.comparisonYear?.monthlyVideoCounts || Array(12).fill(0),
                                    backgroundColor: 'rgba(156, 163, 175, 0.3)',
                                    borderColor: 'rgb(156, 163, 175)',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    borderSkipped: false,
                                    hidden: !showComparison,
                                  },
                                  {
                                    label: `${stats?.primaryYear.year} Videos`,
                                    data: stats?.primaryYear.monthlyVideoCounts || Array(12).fill(0),
                                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
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
                                plugins: {
                                  legend: {
                                    position: 'top' as const,
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

                {/* <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Video Tags</CardTitle>
                      <CardDescription>Most common tags in your watched videos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WordCloudComponent
                        tags={stats?.primaryYear?.tags || []}
                      />
                    </CardContent>
                  </Card>
                </div> */}

                <div className="mt-12 text-center">
                  <ShareStats
                    stats={{
                      watchTime: parseFloat((stats?.primaryYear.watchTime || 0).toFixed(1)),
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
