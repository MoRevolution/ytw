"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, Clock, Film, Home, Share2, Star, Users, Play, GitCompare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/dashboard-header"
import { fetchDefaultComparison, DashboardStats } from "@/lib/fetch-dashboard-data"
import { getChannelThumbnailCached } from "@/lib/youtube-api"
import { CreatorCard } from "@/components/creator-card"

// Mock data for fallback
const mockCreatorStats = {
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
    categoryStats: [
      { name: "Tech", watchTime: 65.2, percentage: 32.5 },
      { name: "Gaming", watchTime: 56.8, percentage: 28.4 },
      { name: "Music", watchTime: 36.0, percentage: 18.0 },
      { name: "Education", watchTime: 24.0, percentage: 12.0 },
      { name: "Entertainment", watchTime: 20.0, percentage: 10.0 }
    ],
    mostWatchedVideos: [],
    longestSession: {
      duration: 0,
      date: "",
      category: "",
      videos: []
    },
    monthlyVideoCounts: [],
    monthlyWatchTime: [],
    tags: []
  },
  discovery: {
    q1: [
      { name: "Kurzgesagt", category: "Educational", date: "Jan 15", channelId: "UCsXVk37bltHxD1rDPwtNM8Q" },
      { name: "Fireship", category: "Programming", date: "Feb 3", channelId: "UCsBjURrPoezykLs9EqgamOA" }
    ],
    q2: [
      { name: "Web Dev Simplified", category: "Programming", date: "Apr 22", channelId: "UCFbNIlppjAuEX4znoulh0Cw" },
      { name: "Binging with Babish", category: "Cooking", date: "May 17", channelId: "UCJHA_jMfCvEnv-3kRjTCQXw" }
    ],
    q3: [
      { name: "Dream", category: "Gaming", date: "Jul 8", channelId: "UCTkXRDQl0luXxVQrRQvWS6w" },
      { name: "Traversy Media", category: "Programming", date: "Aug 29", channelId: "UC29ju8bIPH5as8OGnQzwJyA" }
    ],
    q4: [
      { name: "TED-Ed", category: "Educational", date: "Oct 12", channelId: "UCsooa4yRKGN_zEE8iknghZA" },
      { name: "Theo - t3.gg", category: "Programming", date: "Nov 5", channelId: "UCbRP3c757lWg9M-U7TyEkXA" }
    ]
  },
  loyalty: [
    { name: "MKBHD", percentage: 95, watched: 38, total: 40, channelId: "UCBJycsmduvYEL83R_U4JriQ" },
    { name: "Veritasium", percentage: 88, watched: 22, total: 25, channelId: "UCHnyfMqiRRG1u-2MsSQLbXA" },
    { name: "Fireship", percentage: 75, watched: 45, total: 60, channelId: "UCsBjURrPoezykLs9EqgamOA" }
  ],
  engagement: {
    mostLiked: { name: "MKBHD", count: 35, channelId: "UCBJycsmduvYEL83R_U4JriQ" },
    mostCommented: { name: "Fireship", count: 12, channelId: "UCsBjURrPoezykLs9EqgamOA" },
    mostShared: { name: "Veritasium", count: 8, channelId: "UCHnyfMqiRRG1u-2MsSQLbXA" }
  }
}

export default function CreatorsPage() {
  const [stats, setStats] = useState<{ primaryYear: DashboardStats; comparisonYear?: DashboardStats } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem('creatorStats')
        const cachedTimestamp = localStorage.getItem('creatorStatsTimestamp')
        const now = Date.now()

        let data
        if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 3600000) {
          console.log('📊 Using cached creator stats')
          data = JSON.parse(cachedData)
        } else {
          console.log('🔄 Fetching new creator stats...')
          data = await fetchDefaultComparison()
          localStorage.setItem('creatorStats', JSON.stringify(data))
          localStorage.setItem('creatorStatsTimestamp', now.toString())
        }

        setStats(data)

        // Fetch thumbnails for all creators
        const allCreators = [
          ...data.primaryYear.topCreators,
          ...(data.comparisonYear?.topCreators || []),
          ...mockCreatorStats.discovery.q1,
          ...mockCreatorStats.discovery.q2,
          ...mockCreatorStats.discovery.q3,
          ...mockCreatorStats.discovery.q4,
          ...mockCreatorStats.loyalty,
          mockCreatorStats.engagement.mostLiked,
          mockCreatorStats.engagement.mostCommented,
          mockCreatorStats.engagement.mostShared
        ]

        const thumbnailPromises = allCreators.map(async (creator) => {
          try {
            const thumbnail = await getChannelThumbnailCached(creator.channelId)
            return [creator.channelId, thumbnail]
          } catch (error) {
            console.error(`Failed to fetch thumbnail for ${creator.name}:`, error)
            return [creator.channelId, '/placeholder.svg']
          }
        })

        const thumbnailResults = await Promise.all(thumbnailPromises)
        const thumbnailMap = Object.fromEntries(thumbnailResults)
        setThumbnails(thumbnailMap)

      } catch (error) {
        console.error("❌ Error in fetchData:", error)
        setError('There was an error loading your YouTube data. Showing sample data instead.')
        setStats(mockCreatorStats as { primaryYear: DashboardStats; comparisonYear?: DashboardStats })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to render discovery cards
  const renderDiscoveryCards = (quarter: 'q1' | 'q2' | 'q3' | 'q4') => {
    const creators = mockCreatorStats.discovery[quarter]
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {creators.map((creator) => (
          <div key={creator.name} className="flex items-center gap-4 rounded-lg border p-4">
            <div className="h-12 w-12 rounded-full bg-muted">
              <Image
                src={thumbnails[creator.channelId] || '/placeholder.svg'}
                alt={`${creator.name} avatar`}
                width={48}
                height={48}
                className="rounded-full"
              />
            </div>
            <div>
              <p className="font-medium">{creator.name}</p>
              <p className="text-xs text-muted-foreground">{creator.category}</p>
              <p className="text-xs text-muted-foreground">Discovered {creator.date}</p>
            </div>
          </div>
        ))}
      </div>
    )
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
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Categories
            </Link>
            <Link
              href="/dashboard/creators"
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              Creators
            </Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="container py-6 md:py-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Creator Analysis</h1>
              <p className="text-muted-foreground">Breakdown of the YouTube creators you watched the most in 2023.</p>
              {error && (
                <div className="mt-2 rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
                  {error}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardHeader>
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
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Creators</CardTitle>
                      <CardDescription>Channels you watched the most</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats.primaryYear.topCreators.map((creator, index) => {
                          const comparisonCreator = stats.comparisonYear?.topCreators.find(
                            c => c.name === creator.name
                          )
                          return (
                            <CreatorCard
                              key={creator.name}
                              creator={creator}
                              rank={index + 1}
                              maxWatchTime={stats.primaryYear.topCreators[0].watchTime}
                              comparisonCreator={comparisonCreator}
                            />
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Creator Categories</CardTitle>
                      <CardDescription>Types of creators you watched</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {stats.primaryYear.categoryStats.slice(0, 5).map((category, index) => (
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
                </div>

                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Creator Discovery</CardTitle>
                      <CardDescription>New creators you found this year</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="q1">
                        <TabsList className="mb-4">
                          <TabsTrigger value="q1">Q1</TabsTrigger>
                          <TabsTrigger value="q2">Q2</TabsTrigger>
                          <TabsTrigger value="q3">Q3</TabsTrigger>
                          <TabsTrigger value="q4">Q4</TabsTrigger>
                        </TabsList>
                        <TabsContent value="q1">{renderDiscoveryCards('q1')}</TabsContent>
                        <TabsContent value="q2">{renderDiscoveryCards('q2')}</TabsContent>
                        <TabsContent value="q3">{renderDiscoveryCards('q3')}</TabsContent>
                        <TabsContent value="q4">{renderDiscoveryCards('q4')}</TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Creator Loyalty</CardTitle>
                      <CardDescription>How consistently you watch certain creators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {mockCreatorStats.loyalty.map((creator) => (
                          <div key={creator.name} className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-muted">
                              <Image
                                src={thumbnails[creator.channelId] || '/placeholder.svg'}
                                alt={`${creator.name} avatar`}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{creator.name}</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium">{creator.percentage}%</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">Watched {creator.watched} out of {creator.total} uploads</p>
                              <Progress value={creator.percentage} className="mt-2 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Creator Engagement</CardTitle>
                      <CardDescription>How you interact with creators' content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="rounded-lg bg-muted p-4">
                          <h3 className="font-medium">Most Liked Creator</h3>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted">
                              <Image
                                src={thumbnails[mockCreatorStats.engagement.mostLiked.channelId] || '/placeholder.svg'}
                                alt={`${mockCreatorStats.engagement.mostLiked.name} avatar`}
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{mockCreatorStats.engagement.mostLiked.name}</p>
                              <p className="text-xs text-muted-foreground">You liked {mockCreatorStats.engagement.mostLiked.count} videos</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <h3 className="font-medium">Most Commented Creator</h3>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted">
                              <Image
                                src={thumbnails[mockCreatorStats.engagement.mostCommented.channelId] || '/placeholder.svg'}
                                alt={`${mockCreatorStats.engagement.mostCommented.name} avatar`}
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{mockCreatorStats.engagement.mostCommented.name}</p>
                              <p className="text-xs text-muted-foreground">You commented on {mockCreatorStats.engagement.mostCommented.count} videos</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <h3 className="font-medium">Most Shared Creator</h3>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted">
                              <Image
                                src={thumbnails[mockCreatorStats.engagement.mostShared.channelId] || '/placeholder.svg'}
                                alt={`${mockCreatorStats.engagement.mostShared.name} avatar`}
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{mockCreatorStats.engagement.mostShared.name}</p>
                              <p className="text-xs text-muted-foreground">You shared {mockCreatorStats.engagement.mostShared.count} videos</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
