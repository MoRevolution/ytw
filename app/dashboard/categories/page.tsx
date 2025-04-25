"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, Clock, Film, Home, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { fetchCategoryData } from "@/lib/fetch-categories-data"
import { getCategoryName } from "@/lib/youtube-categories"

interface CategoryData {
  year: number
  totalWatchTime: number
  categoryDistribution: {
    categoryId: string
    watchTime: number
    videoCount: number
    percentage: number
    topVideos: {
      videoId: string
      title: string
      channelTitle: string
      watchCount: number
      duration: number
    }[]
  }[]
  categoryComparison: {
    categoryId: string
    currentYear: {
      watchTime: number
      percentage: number
    }
    previousYear: {
      watchTime: number
      percentage: number
    }
    change: number
  }[]
}

// Mock data for sample user
const mockCategoryData: CategoryData = {
  year: 2024,
  totalWatchTime: 247,
  categoryDistribution: [
    { 
      categoryId: "20", 
      watchTime: 79, 
      videoCount: 320, 
      percentage: 32,
      topVideos: [
        {
          videoId: "abc123",
          title: "Minecraft Hardcore Survival: Day 1000",
          channelTitle: "PewDiePie",
          watchCount: 14,
          duration: 3600
        },
        {
          videoId: "def456",
          title: "Fortnite Chapter 4 Season 2: Gameplay",
          channelTitle: "Ninja",
          watchCount: 9,
          duration: 1800
        },
        {
          videoId: "ghi789",
          title: "League of Legends: Pro Tips and Tricks",
          channelTitle: "Faker",
          watchCount: 7,
          duration: 2400
        }
      ]
    },
    { 
      categoryId: "28", 
      watchTime: 69, 
      videoCount: 280, 
      percentage: 28,
      topVideos: [
        {
          videoId: "jkl012",
          title: "iPhone 15 Pro: Honest Review",
          channelTitle: "MKBHD",
          watchCount: 11,
          duration: 2700
        },
        {
          videoId: "mno345",
          title: "The Ultimate Guide to Next.js 13 App Router",
          channelTitle: "Fireship",
          watchCount: 8,
          duration: 1500
        },
        {
          videoId: "pqr678",
          title: "Building a $5000 Gaming PC",
          channelTitle: "Linus Tech Tips",
          watchCount: 6,
          duration: 2100
        }
      ]
    },
    { 
      categoryId: "10", 
      watchTime: 44, 
      videoCount: 180, 
      percentage: 18,
      topVideos: []
    },
    { 
      categoryId: "27", 
      watchTime: 30, 
      videoCount: 120, 
      percentage: 12,
      topVideos: []
    },
    { 
      categoryId: "24", 
      watchTime: 25, 
      videoCount: 100, 
      percentage: 10,
      topVideos: []
    }
  ],
  categoryComparison: [
    {
      categoryId: "20",
      currentYear: { watchTime: 79, percentage: 32 },
      previousYear: { watchTime: 59, percentage: 24 },
      change: 8
    },
    {
      categoryId: "28",
      currentYear: { watchTime: 69, percentage: 28 },
      previousYear: { watchTime: 62, percentage: 25 },
      change: 3
    },
    {
      categoryId: "10",
      currentYear: { watchTime: 44, percentage: 18 },
      previousYear: { watchTime: 49, percentage: 20 },
      change: -2
    },
    {
      categoryId: "27",
      currentYear: { watchTime: 30, percentage: 12 },
      previousYear: { watchTime: 20, percentage: 8 },
      change: 4
    },
    {
      categoryId: "24",
      currentYear: { watchTime: 25, percentage: 10 },
      previousYear: { watchTime: 57, percentage: 23 },
      change: -13
    }
  ]
}

// Add localStorage cache helpers
const CACHE_KEY_PREFIX = 'ytw-categories-'

function getCachedData(year: number): CategoryData | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${year}`)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

function setCachedData(year: number, data: CategoryData): void {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${year}`, JSON.stringify(data))
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}

export default function CategoriesPage() {
  const { isLoggedIn, isSampleUser } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<CategoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isSampleUser) {
          console.log('📊 Using mock data for sample user')
          setData(mockCategoryData)
          setIsLoading(false)
          return
        }

        // Get the most recent complete year
        const currentYear = new Date().getFullYear()
        const yearToAnalyze = currentYear - 1 // Use previous year since current year is incomplete
        
        // Check cache first
        const cachedData = getCachedData(yearToAnalyze)
        
        if (cachedData) {
          console.log('📦 Using cached category data')
          setData(cachedData)
          setIsLoading(false)
          return
        }
        
        const categoryData = await fetchCategoryData(yearToAnalyze)
        setCachedData(yearToAnalyze, categoryData)
        setData(categoryData)
      } catch (error) {
        console.error("❌ Error fetching category data:", error)
        console.log('⚠️ Using mock data as fallback')
        setData(mockCategoryData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isSampleUser])

  // If not logged in, don't render the page content
  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container py-6 md:py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container py-6 md:py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No data available</h2>
          <p className="text-muted-foreground">Please check back later</p>
        </div>
      </div>
    )
  }

  const categoryColors = {
    "20": "bg-red-500", // Gaming
    "28": "bg-blue-500", // Tech
    "10": "bg-green-500", // Music
    "27": "bg-yellow-500", // Education
    "24": "bg-purple-500" // Entertainment
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
              <p className="text-muted-foreground">
                Breakdown of your YouTube viewing by category in {data.year}
                {data.categoryComparison[0]?.previousYear.percentage > 0 && 
                  ` compared to ${data.year - 1}`}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Percentage of watch time by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.categoryDistribution.map((category) => (
                      <div key={category.categoryId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${categoryColors[category.categoryId as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
                            <span>{getCategoryName(category.categoryId)}</span>
                          </div>
                          <span className="text-sm font-medium">{Math.round(category.percentage)}%</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round(category.watchTime)} hours ({category.videoCount} videos)
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Comparison</CardTitle>
                  <CardDescription>How your interests changed from {data.year - 1}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {data.categoryComparison.map((comparison) => (
                      <div key={comparison.categoryId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>{getCategoryName(comparison.categoryId)}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${comparison.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {comparison.change > 0 ? '+' : ''}{Math.round(comparison.change)}%
                            </span>
                            <span className="text-sm">
                              from {Math.round(comparison.previousYear.percentage)}% in {data.year - 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex h-2 w-full items-center gap-1">
                          <div 
                            className={`h-full rounded-l-full bg-muted`}
                            style={{ width: `${comparison.previousYear.percentage}%` }}
                          ></div>
                          <div 
                            className={`h-full rounded-r-full ${comparison.change > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.abs(comparison.change)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.categoryDistribution.slice(0, 2).map((category) => (
                <Card key={category.categoryId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Top {getCategoryName(category.categoryId)} Videos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.topVideos?.map((video) => (
                        <div key={video.videoId} className="flex items-start gap-3">
                          <div className="relative h-[90px] w-[160px] shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                              alt={video.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium line-clamp-2">{video.title}</p>
                            <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              Watched {video.watchCount} {video.watchCount === 1 ? 'time' : 'times'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                        In {data.year}, you started watching these categories that you rarely watched before:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {data.categoryComparison
                          .filter(comp => comp.change > 0)
                          .slice(0, 3)
                          .map(comp => (
                            <li key={comp.categoryId} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
                              <span>
                                {getCategoryName(comp.categoryId)} (+{Math.round(comp.change)}%)
                              </span>
                            </li>
                          ))}
                        {data.categoryComparison.filter(comp => comp.change > 0).length === 0 && (
                          <li className="text-muted-foreground">No significant new categories this year</li>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <h3 className="font-medium">Category Diversity</h3>
                      </div>
                      <p className="mt-2 text-sm">
                        Your content diversity score is{' '}
                        <span className="font-medium">
                          {Math.round((data.categoryDistribution.length / 5) * 100)}/100
                        </span>
                        , which means you watch a good variety of content across different categories.
                      </p>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/20">
                        <div 
                          className="h-full rounded-full bg-yellow-500" 
                          style={{ width: `${(data.categoryDistribution.length / 5) * 100}%` }}
                        ></div>
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
