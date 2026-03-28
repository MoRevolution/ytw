"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Play, TrendingUp, TrendingDown, Sparkles, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedCard, AnimatedStat } from "@/components/animated-card"
import { useAuth } from "@/contexts/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { fetchCategoryData } from "@/lib/fetch-categories-data"
import { getCategoryName } from "@/lib/youtube-categories"
import { mockCategoryData } from "@/lib/mock-data"


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
  const { isLoggedIn, isAuthLoading, isSampleUser } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<CategoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not logged in (only after auth has finished loading)
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, isAuthLoading, router])

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
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="container py-6 md:py-12">
              <div className="mb-8">
                <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
                <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted"></div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="h-5 w-32 animate-pulse rounded bg-muted"></div>
                      <div className="h-4 w-48 animate-pulse rounded bg-muted"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="space-y-2">
                            <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                            <div className="h-2 w-full animate-pulse rounded bg-muted"></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
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
        <Sidebar />
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
              <AnimatedCard delay={0}>
                <Card className="card-hover card-hero relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-500" />
                      Category Distribution
                    </CardTitle>
                    <CardDescription>Percentage of watch time by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.categoryDistribution.map((category, index) => (
                        <div key={category.categoryId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${categoryColors[category.categoryId as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
                              <span className="font-medium">{getCategoryName(category.categoryId)}</span>
                            </div>
                            <span className="text-sm font-medium">
                              <AnimatedStat value={Math.round(category.percentage)} delay={index * 50} />%
                            </span>
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
              </AnimatedCard>

              <AnimatedCard delay={100}>
                <Card className="card-hover card-hero relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      Category Comparison
                    </CardTitle>
                    <CardDescription>How your interests changed from {data.year - 1}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {data.categoryComparison.map((comparison, index) => (
                        <div key={comparison.categoryId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{getCategoryName(comparison.categoryId)}</span>
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1 text-sm font-medium ${comparison.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {comparison.change > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                {comparison.change > 0 ? '+' : ''}{Math.round(comparison.change)}%
                              </span>
                              <span className="text-sm text-muted-foreground">
                                from {Math.round(comparison.previousYear.percentage)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex h-2 w-full items-center gap-1">
                            <div 
                              className="h-full rounded-l-full bg-muted"
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
              </AnimatedCard>
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
                        <a 
                          key={video.videoId}
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative h-[90px] w-[160px] shrink-0 overflow-hidden rounded-md bg-muted group">
                              <Image
                                src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                alt={video.title}
                                fill
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-black/50 rounded-full p-2">
                                  <Play className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium line-clamp-2 hover:text-primary transition-colors">{video.title}</p>
                              <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                Watched {video.watchCount} {video.watchCount === 1 ? 'time' : 'times'}
                              </p>
                            </div>
                          </div>
                        </a>
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
