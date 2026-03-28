"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Film, Share2, Star, Play, GitCompare, 
  Gamepad2, Monitor, Music, GraduationCap, Tv, 
  Popcorn, Timer, Flame, HelpCircle, ToggleLeft, ToggleRight
} from "lucide-react"
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
import { AnimatedCard, AnimatedStat } from "@/components/animated-card"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { useDashboardStats, DashboardStatsResult } from "@/hooks/use-dashboard-stats"
import { CategoryStats } from "@/lib/fetch-dashboard-data"
import { getChannelThumbnailCached } from "@/lib/youtube-api"
import { WordCloudComponent } from "@/components/word-cloud"
import { CreatorCard } from "@/components/creator-card"
import { mockDashboardStats } from "@/lib/mock-data"

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Gaming": <Gamepad2 className="h-4 w-4" />,
  "Tech": <Monitor className="h-4 w-4" />,
  "Music": <Music className="h-4 w-4" />,
  "Education": <GraduationCap className="h-4 w-4" />,
  "Entertainment": <Tv className="h-4 w-4" />,
  "Science & Technology": <Monitor className="h-4 w-4" />,
  "People & Blogs": <Film className="h-4 w-4" />,
  "Comedy": <Popcorn className="h-4 w-4" />,
}

// Category colors for gradients
const CATEGORY_COLORS = [
  { bg: "from-red-500/20 to-red-500/5", bar: "bg-gradient-to-r from-red-500 to-red-400" },
  { bg: "from-purple-500/20 to-purple-500/5", bar: "bg-gradient-to-r from-purple-500 to-purple-400" },
  { bg: "from-blue-500/20 to-blue-500/5", bar: "bg-gradient-to-r from-blue-500 to-blue-400" },
  { bg: "from-green-500/20 to-green-500/5", bar: "bg-gradient-to-r from-green-500 to-green-400" },
  { bg: "from-orange-500/20 to-orange-500/5", bar: "bg-gradient-to-r from-orange-500 to-orange-400" },
  { bg: "from-pink-500/20 to-pink-500/5", bar: "bg-gradient-to-r from-pink-500 to-pink-400" },
]

// Fun comparisons for marathon sessions
function getMarathonComparison(hours: number): string {
  if (hours >= 10) return "That's a full work day of pure YouTube! 🏆"
  if (hours >= 6) return "You could've watched the entire Lord of the Rings trilogy!"
  if (hours >= 4) return "Enough time to fly from NYC to LA ✈️"
  if (hours >= 3) return "That's longer than Titanic! 🚢"
  if (hours >= 2) return "A proper movie marathon session 🍿"
  return "A solid binge-watching session! 📺"
}

export default function DashboardPage() {
  const { isLoggedIn, isAuthLoading, isSampleUser } = useAuth()
  const router = useRouter()
  const [showComparison, setShowComparison] = useState(false)
  const [showNormalized, setShowNormalized] = useState(false)

  // Use the custom hook for data fetching with caching
  const { stats, isLoading, error } = useDashboardStats({
    enabled: isLoggedIn,
    useMockData: isSampleUser,
    mockData: mockDashboardStats as DashboardStatsResult,
  })

  // Redirect if not logged in (only after auth has finished loading)
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, router, isAuthLoading])

  // Show error toast if there's an error (but we still have fallback data)
  useEffect(() => {
    if (error && stats) {
      console.warn("Using fallback data due to error:", error.message)
    }
  }, [error, stats])

  if (isAuthLoading || (!isLoggedIn && !isLoading)) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <Sidebar />
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
                  <AnimatedCard delay={0}>
                  <Card className="card-hover card-hero">
                    <CardHeader className="pb-2">
                      <CardTitle>Total Watch Time</CardTitle>
                      <CardDescription>Hours spent watching videos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">
                        <AnimatedStat value={stats?.primaryYear.watchTime || 0} decimals={1} />
                      </div>
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
                  </AnimatedCard>
                  <AnimatedCard delay={100}>
                  <Card className="card-hover card-hero">
                    <CardHeader className="pb-2">
                      <CardTitle>Videos Watched</CardTitle>
                      <CardDescription>Total number of videos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">
                        <AnimatedStat value={stats.primaryYear.videosWatched} delay={100} />
                      </div>
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
                  </AnimatedCard>
                  <AnimatedCard delay={200}>
                  <Card className="card-hover card-hero">
                    <CardHeader className="pb-2">
                      <CardTitle>Unique Creators</CardTitle>
                      <CardDescription>Different channels you watched</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">
                        <AnimatedStat value={stats.primaryYear.uniqueCreators} delay={200} />
                      </div>
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
                  </AnimatedCard>
                </div>
                
                <div className="mt-8">
                    {/* <h2 className="mb-4 text-2xl font-bold tracking-tight">Your {stats.primaryYear.year} Highlights</h2> */}
                    <AnimatedCard delay={300}>
                    <div className="w-full">
                    <Card className="w-full overflow-hidden">
                      <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Your faves</CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-2">
                      <div className="flex gap-4 overflow-x-auto pb-3 scroll-container">
                      {stats?.primaryYear.mostWatchedVideos?.map((video, index) => (
                        <a 
                          key={video.videoId}
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block flex-shrink-0"
                          style={{ width: 'calc((100% - 64px) / 5)' }}
                        >
                          <div className="aspect-video overflow-hidden rounded-md bg-muted group relative">
                          <Image
                            src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                            alt="Video thumbnail"
                            width={320}
                            height={180}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/placeholder.svg?height=180&width=320`;
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
                  </AnimatedCard>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Tabbed Categories & Creators - takes 2 columns on lg */}
                  <AnimatedCard delay={400} className="md:col-span-1 lg:col-span-2">
                    <Card className="h-full min-h-[380px]">
                      <Tabs defaultValue="categories" className="h-full flex flex-col">
                        <CardHeader className="pb-0">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="categories" className="gap-2">
                              <Tv className="h-4 w-4" />
                              Top Categories
                            </TabsTrigger>
                            <TabsTrigger value="creators" className="gap-2">
                              <Star className="h-4 w-4" />
                              Top Creators
                            </TabsTrigger>
                          </TabsList>
                        </CardHeader>
                        <CardContent className="flex-1 pt-6 overflow-hidden">
                          <TabsContent value="categories" className="mt-0 h-full">
                            <div className="space-y-3">
                              {stats?.primaryYear?.categoryStats?.slice(0, 5).map((category: CategoryStats, index: number) => {
                                const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                                return (
                                  <div 
                                    key={category.name} 
                                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                                      {CATEGORY_ICONS[category.name] || <Film className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium truncate">{category.name}</span>
                                        <span className="text-sm text-muted-foreground ml-2">{category.watchTime.toFixed(1)}h</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                                            style={{ width: `${category.percentage}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-medium w-12 text-right">{category.percentage.toFixed(1)}%</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </TabsContent>
                          <TabsContent value="creators" className="mt-0 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                              <button
                                onClick={() => setShowNormalized(!showNormalized)}
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showNormalized ? (
                                  <ToggleRight className="h-4 w-4 text-primary" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4" />
                                )}
                                <span>{showNormalized ? 'Normalized' : 'Raw hours'}</span>
                              </button>
                              <div className="group relative">
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                <div className="absolute right-0 top-6 w-48 p-2 bg-popover border rounded-md shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  <strong>Raw:</strong> Total watch time<br/>
                                  <strong>Normalized:</strong> Adjusts for video length so creators with shorter videos aren't penalized
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3 flex-1">
                              {(() => {
                                // Sort by normalized or raw based on toggle, then take top 5
                                const sortedCreators = [...stats.primaryYear.topCreators]
                                  .sort((a, b) => 
                                    showNormalized 
                                      ? (b.normalizedScore || 0) - (a.normalizedScore || 0)
                                      : b.watchTime - a.watchTime
                                  )
                                  .slice(0, 5) // Take top 5 after sorting
                                const maxValue = showNormalized
                                  ? Math.max(...sortedCreators.map(c => c.normalizedScore || 0))
                                  : Math.max(...sortedCreators.map(c => c.watchTime))
                                return sortedCreators.map((creator, index) => {
                                  const comparisonCreator = stats.comparisonYear?.topCreators.find(
                                    c => c.name === creator.name
                                  )
                                  return (
                                    <CreatorCard 
                                      key={creator.name} 
                                      creator={creator} 
                                      rank={index + 1}
                                      comparisonCreator={comparisonCreator}
                                      maxWatchTime={maxValue}
                                      showNormalized={showNormalized}
                                    />
                                  )
                                })
                              })()}
                            </div>
                          </TabsContent>
                        </CardContent>
                      </Tabs>
                    </Card>
                  </AnimatedCard>

                  {/* Marathon Session Card */}
                  <AnimatedCard delay={500}>
                    <Card className="card-hover h-full min-h-[380px] relative overflow-hidden flex flex-col">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full" />
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
                              <Flame className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Marathon Mode 🍿</CardTitle>
                              <CardDescription>Your longest viewing session</CardDescription>
                            </div>
                          </div>
                          <div className="group relative z-10">
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            <div className="absolute right-0 top-6 w-52 p-2 bg-popover border rounded-md shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              A session is defined as consecutive videos watched within 30 minutes of each other. We find your longest uninterrupted viewing streak!
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col overflow-hidden">
                        {/* Top section - Stats (centered in its half) */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div>
                            <p className="text-4xl font-bold text-orange-500">
                              {stats?.primaryYear?.longestSession?.duration?.toFixed(1) || "0"}
                              <span className="text-lg font-normal text-muted-foreground ml-1">hours</span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {getMarathonComparison(stats?.primaryYear?.longestSession?.duration || 0)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3">
                            {stats?.primaryYear?.longestSession?.date && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Timer className="h-4 w-4" />
                                <span>
                                  {new Date(stats.primaryYear.longestSession.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                            
                            {stats?.primaryYear?.longestSession?.category && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm">
                                {CATEGORY_ICONS[stats.primaryYear.longestSession.category] || <Tv className="h-3 w-3" />}
                                <span>{stats.primaryYear.longestSession.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Bottom section - Videos (centered in its half) */}
                        {stats?.primaryYear?.longestSession?.videos && stats.primaryYear.longestSession.videos.length > 0 && (
                          <div className="flex-1 flex flex-col justify-center border-t pt-3">
                            <p className="text-xs text-muted-foreground mb-2">
                              Videos from this session ({stats.primaryYear.longestSession.videos.length}):
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-1 scroll-container">
                              {stats.primaryYear.longestSession.videos.slice(0, 10).map((video, index) => (
                                <a 
                                  key={`${video.videoId}-${index}`}
                                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex-shrink-0 w-36"
                                >
                                  <div className="relative aspect-video rounded overflow-hidden bg-muted">
                                    <Image
                                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                      alt={video.title}
                                      fill
                                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="bg-black/60 rounded-full p-1.5">
                                        <Play className="h-3 w-3 text-white" />
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs font-medium mt-1 line-clamp-1 group-hover:text-primary transition-colors">
                                    {video.title}
                                  </p>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </div>

                <AnimatedCard delay={600}>
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
                </AnimatedCard>

                {/* Word Cloud - Video Tags */}
                {stats?.primaryYear?.tags && stats.primaryYear.tags.length > 0 && (
                  <AnimatedCard delay={700}>
                    <div className="mt-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Your Video DNA 🧬</CardTitle>
                          <CardDescription>Most common tags from your watched videos</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <WordCloudComponent
                            tags={stats.primaryYear.tags}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </AnimatedCard>
                )}

                <AnimatedCard delay={800}>
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
                </AnimatedCard>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
