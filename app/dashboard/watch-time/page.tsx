"use client"

import Link from "next/link"
import { BarChart3, Clock, Film, Home, Users, ArrowDown, ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { fetchWatchTimeStats } from "@/lib/fetch-watch-time-data"
import { useAuth } from "@/contexts/auth-context"
import { getCategoryName } from "@/lib/youtube-categories"

interface WatchTimeStats {
  totalWatchTime: number
  averageDailyWatchTime: number
  averageVideoLength: number
  dailyWatchTime: {
    date: string
    watchTime: number
  }[]
  videoLengthDistribution: {
    length: string
    count: number
  }[]
  year: number
  weeklyPatterns: {
    dayOfWeek: string
    averageWatchTime: number
  }[]
  dailyPatterns: {
    hour: number
    averageWatchTime: number
  }[]
  previousYearStats?: {
    averageDailyWatchTime: number
    averageVideoLength: number
    year: number
  }
  milestones: {
    longestSingleDay: {
      date: string
      watchTime: number
      videoCount: number
      category?: string
    }
    mostActiveMonth: {
      month: string
      watchTime: number
      videoCount: number
      increaseFromAverage: number
    }
    longestSession: {
      date: string
      duration: number
      category?: string
    }
    totalHoursMilestone: {
      hours: number
      date: string
    }
  }
}

// Mock data for fallback and sample user
const mockStats: WatchTimeStats = {
  totalWatchTime: 247,
  averageDailyWatchTime: 0.68, // 40.7 minutes
  averageVideoLength: 0.135, // 8.1 minutes
  year: 2024,
  dailyWatchTime: Array.from({ length: 365 }, (_, i) => ({
    date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    watchTime: Math.random() * 2 // Random watch time between 0-2 hours
  })),
  videoLengthDistribution: [
    { length: "0-5 min", count: 450 },
    { length: "5-10 min", count: 620 },
    { length: "10-15 min", count: 380 },
    { length: "15-20 min", count: 250 },
    { length: "20-30 min", count: 180 },
    { length: "30+ min", count: 120 }
  ],
  weeklyPatterns: [
    { dayOfWeek: "Sunday", averageWatchTime: 75 },
    { dayOfWeek: "Monday", averageWatchTime: 35 },
    { dayOfWeek: "Tuesday", averageWatchTime: 38 },
    { dayOfWeek: "Wednesday", averageWatchTime: 35 },
    { dayOfWeek: "Thursday", averageWatchTime: 40 },
    { dayOfWeek: "Friday", averageWatchTime: 45 },
    { dayOfWeek: "Saturday", averageWatchTime: 68 }
  ],
  dailyPatterns: [
    { hour: 0, averageWatchTime: 10 },
    { hour: 1, averageWatchTime: 5 },
    { hour: 2, averageWatchTime: 3 },
    { hour: 3, averageWatchTime: 2 },
    { hour: 4, averageWatchTime: 1 },
    { hour: 5, averageWatchTime: 2 },
    { hour: 6, averageWatchTime: 5 },
    { hour: 7, averageWatchTime: 8 },
    { hour: 8, averageWatchTime: 12 },
    { hour: 9, averageWatchTime: 15 },
    { hour: 10, averageWatchTime: 20 },
    { hour: 11, averageWatchTime: 25 },
    { hour: 12, averageWatchTime: 30 },
    { hour: 13, averageWatchTime: 35 },
    { hour: 14, averageWatchTime: 40 },
    { hour: 15, averageWatchTime: 45 },
    { hour: 16, averageWatchTime: 50 },
    { hour: 17, averageWatchTime: 55 },
    { hour: 18, averageWatchTime: 60 },
    { hour: 19, averageWatchTime: 65 },
    { hour: 20, averageWatchTime: 70 },
    { hour: 21, averageWatchTime: 75 },
    { hour: 22, averageWatchTime: 60 },
    { hour: 23, averageWatchTime: 30 }
  ],
  previousYearStats: {
    averageDailyWatchTime: 0.55, // 33 minutes
    averageVideoLength: 0.12, // 7.2 minutes
    year: 2023
  },
  milestones: {
    longestSingleDay: {
      date: "2024-07-15",
      watchTime: 5.2,
      videoCount: 14,
      category: "24" // Gaming category
    },
    mostActiveMonth: {
      month: "2024-08",
      watchTime: 40,
      videoCount: 230,
      increaseFromAverage: 28
    },
    longestSession: {
      date: "2024-10-08",
      duration: 3.5,
      category: "28" // Tech category
    },
    totalHoursMilestone: {
      hours: 250,
      date: "2024-12-28"
    }
  }
}

// Add localStorage cache helpers
const CACHE_KEY_PREFIX = 'ytw-stats-'

function getCachedStats(year: number): WatchTimeStats | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${year}`)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

function setCachedStats(year: number, stats: WatchTimeStats): void {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${year}`, JSON.stringify(stats))
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export default function WatchTimePage() {
  const { isLoggedIn, isSampleUser } = useAuth()
  const [stats, setStats] = useState<WatchTimeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to convert UTC to Central Time (UTC-6)
  const convertToCentralTime = (date: Date) => {
    const centralDate = new Date(date)
    centralDate.setHours(centralDate.getHours() - 6)
    return centralDate
  }

  // Function to process watch time data with Central Time
  const processWatchTimeData = (data: WatchTimeStats): WatchTimeStats => {
    return {
      ...data,
      dailyPatterns: data.dailyPatterns.map(pattern => {
        // Convert the hour to Central Time
        const date = new Date()
        date.setHours(pattern.hour, 0, 0, 0)
        const centralDate = convertToCentralTime(date)
        return {
          hour: centralDate.getHours(),
          averageWatchTime: pattern.averageWatchTime
        }
      }),
      weeklyPatterns: data.weeklyPatterns.map(pattern => {
        // Keep the day of week as is since it's relative
        return pattern
      }),
      milestones: data.milestones || {
        longestSingleDay: {
          date: new Date().toISOString().split('T')[0],
          watchTime: 0,
          videoCount: 0
        },
        mostActiveMonth: {
          month: new Date().toISOString().split('T')[0].substring(0, 7),
          watchTime: 0,
          videoCount: 0,
          increaseFromAverage: 0
        },
        longestSession: {
          date: new Date().toISOString().split('T')[0],
          duration: 0
        },
        totalHoursMilestone: {
          hours: 0,
          date: new Date().toISOString().split('T')[0]
        }
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isSampleUser) {
          console.log('📊 Using mock data for sample user')
          setStats(processWatchTimeData(mockStats))
          setIsLoading(false)
          return
        }

        // Get the most recent complete year (2024 since 2025 is incomplete)
        const currentYear = new Date().getFullYear()
        const yearToAnalyze = currentYear - 1 // Use 2024 since 2025 is incomplete
        console.log('🔄 Fetching watch time stats for year:', yearToAnalyze)
        
        // Check cache first
        const cachedStats = getCachedStats(yearToAnalyze)
        
        if (cachedStats) {
          console.log('📦 Using cached stats')
          setStats(processWatchTimeData(cachedStats))
          setIsLoading(false)
          return
        }
        
        const data = await fetchWatchTimeStats(yearToAnalyze)
        
        // Ensure year is included in the stats
        const statsWithYear: WatchTimeStats = {
          ...data,
          year: yearToAnalyze,
          previousYearStats: data.previousYearStats ? {
            ...data.previousYearStats,
            year: yearToAnalyze - 1 // 2023
          } : undefined
        }
        
        // Cache the stats
        setCachedStats(yearToAnalyze, statsWithYear)
        
        setStats(processWatchTimeData(statsWithYear))
      } catch (error) {
        console.error("❌ Error fetching watch time stats:", error)
        console.log('⚠️ Using mock data as fallback')
        setStats(processWatchTimeData(mockStats))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isSampleUser])

  if (isLoading) {
    return (
      <div className="container py-6 md:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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

  if (!stats) {
    return (
      <div className="container py-6 md:py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No data available</h2>
          <p className="text-muted-foreground">Please check back later</p>
        </div>
      </div>
    )
  }

  // Calculate equivalent times
  const daysOfContinuousWatching = (stats.totalWatchTime / 24).toFixed(1)
  const workDays = (stats.totalWatchTime / 8).toFixed(1)
  const workWeeks = (stats.totalWatchTime / 40).toFixed(1)

  // Calculate percentage for average daily watch time bar
  const maxDailyWatchTime = 3 // 3 hours
  const dailyWatchTimePercentage = Math.min((stats.averageDailyWatchTime / maxDailyWatchTime) * 100, 100)

  // Calculate year-over-year changes
  const dailyWatchTimeChange = stats.previousYearStats 
    ? calculatePercentageChange(stats.averageDailyWatchTime, stats.previousYearStats.averageDailyWatchTime)
    : 0

  const videoLengthChange = stats.previousYearStats
    ? calculatePercentageChange(stats.averageVideoLength, stats.previousYearStats.averageVideoLength)
    : 0

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
              className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium"
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
              <h1 className="text-3xl font-bold tracking-tight">Watch Time Analysis</h1>
              <p className="text-muted-foreground">
                Detailed breakdown of your YouTube viewing habits in {stats?.year}
                {stats?.previousYearStats && ` compared to ${stats.previousYearStats.year}`}.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Watch Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{Math.round(stats.totalWatchTime)}</div>
                  <p className="text-xs text-muted-foreground">hours</p>
                  <div className="mt-2 text-sm text-muted-foreground">That's equivalent to:</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span>{daysOfContinuousWatching} days of continuous watching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span>{workDays} eight-hour workdays</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span>{workWeeks} 40-hour work weeks</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Average Daily Watch Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{Math.round(stats.averageDailyWatchTime * 60)}</div>
                  <p className="text-xs text-muted-foreground">minutes per day</p>
                  {stats.previousYearStats && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      {dailyWatchTimeChange > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={dailyWatchTimeChange > 0 ? "text-green-500" : "text-red-500"}>
                        {Math.abs(Math.round(dailyWatchTimeChange))}%
                      </span>
                      <span className="text-muted-foreground">from last year</span>
                    </div>
                  )}
                  <div className="mt-4 h-4 rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-red-500" 
                      style={{ width: `${dailyWatchTimePercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>1 hour</span>
                    <span>2 hours</span>
                    <span>3 hours</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Average Video Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{Math.round(stats.averageVideoLength * 60)}</div>
                  <p className="text-xs text-muted-foreground">minutes per video</p>
                  {stats.previousYearStats && (
                    <div className="mt-4 flex items-center gap-1 text-sm">
                      {videoLengthChange > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={videoLengthChange > 0 ? "text-green-500" : "text-red-500"}>
                        {Math.abs(Math.round(videoLengthChange))}%
                      </span>
                      <span className="text-muted-foreground">from last year</span>
                    </div>
                  )}
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
                      <TabsTrigger value="daily">Daily Average</TabsTrigger>
                    </TabsList>
                    <TabsContent value="hours">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats?.dailyWatchTime.reduce((acc, entry) => {
                              const month = new Date(entry.date).getMonth()
                              acc[month] = (acc[month] || 0) + entry.watchTime
                              return acc
                            }, Array(12).fill(0)).map((hours, index) => ({
                              month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index],
                              hours: Math.round(hours)
                            }))}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                      <p className="font-medium text-card-foreground">{label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {Math.round(payload[0].value as number)} hours
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="hours" fill="url(#monthlyGradient)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="videos">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats?.dailyWatchTime.reduce((acc, entry) => {
                              const month = new Date(entry.date).getMonth()
                              acc[month] = (acc[month] || 0) + 1 // Count each day as one video
                              return acc
                            }, Array(12).fill(0)).map((count, index) => ({
                              month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index],
                              videos: count
                            }))}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis label={{ value: 'Videos', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                      <p className="font-medium text-card-foreground">{label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {Math.round(payload[0].value as number)} videos
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="videos" fill="url(#monthlyGradient)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    <TabsContent value="daily">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats?.dailyWatchTime.reduce((acc, entry) => {
                              const month = new Date(entry.date).getMonth()
                              acc[month] = {
                                total: (acc[month]?.total || 0) + entry.watchTime,
                                count: (acc[month]?.count || 0) + 1
                              }
                              return acc
                            }, Array(12).fill({ total: 0, count: 0 })).map((monthData, index) => ({
                              month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index],
                              minutes: Math.round((monthData.total / monthData.count) * 60)
                            }))}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                      <p className="font-medium text-card-foreground">{label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {Math.round(payload[0].value as number)} minutes/day
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="minutes" fill="url(#monthlyGradient)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>


            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Viewing Pattern</CardTitle>
                  <CardDescription>Your average watch time by day of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.weeklyPatterns}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="dayOfWeek" 
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis 
                          label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                  <p className="font-medium text-card-foreground">{label}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {Math.round(payload[0].value as number)} minutes
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="averageWatchTime" 
                          fill="url(#weeklyGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Insights</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {(() => {
                        // Calculate weekend vs weekday average
                        const weekendDays = stats.weeklyPatterns.filter(p => p.dayOfWeek === 'Saturday' || p.dayOfWeek === 'Sunday');
                        const weekdays = stats.weeklyPatterns.filter(p => p.dayOfWeek !== 'Saturday' && p.dayOfWeek !== 'Sunday');
                        const weekendAvg = weekendDays.reduce((sum, day) => sum + day.averageWatchTime, 0) / weekendDays.length;
                        const weekdayAvg = weekdays.reduce((sum, day) => sum + day.averageWatchTime, 0) / weekdays.length;
                        const weekendIncrease = Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100);

                        // Find most and least active days
                        const sortedDays = [...stats.weeklyPatterns].sort((a, b) => b.averageWatchTime - a.averageWatchTime);
                        const mostActive = sortedDays[0];
                        const leastActive = sortedDays[sortedDays.length - 1];

                        return (
                          <>
                            <li className="flex items-start gap-2">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                              <span>
                                You watch <span className="font-medium">{weekendIncrease}% more content</span> on weekends compared to
                                weekdays
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                              <span>
                                {mostActive.dayOfWeek} is your most active day with an average of{" "}
                                <span className="font-medium">{Math.round(mostActive.averageWatchTime)} minutes</span> of watch time
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                              <span>
                                {leastActive.dayOfWeek} is your least active day with an average of{" "}
                                <span className="font-medium">{Math.round(leastActive.averageWatchTime)} minutes</span> of watch time
                              </span>
                            </li>
                          </>
                        );
                      })()}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Viewing Pattern</CardTitle>
                  <CardDescription>When you watch YouTube throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stats.dailyPatterns}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="hour" 
                          tickFormatter={(value) => {
                            if (value === 0) return '12 AM'
                            if (value === 12) return '12 PM'
                            return value < 12 ? `${value} AM` : `${value - 12} PM`
                          }}
                        />
                        <YAxis 
                          label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const hour = label as number;
                              const timeLabel = hour === 0 ? '12 AM' : 
                                              hour === 12 ? '12 PM' : 
                                              hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
                              return (
                                <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                  <p className="font-medium text-card-foreground">{timeLabel}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {Math.round(payload[0].value as number)} minutes
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="averageWatchTime" 
                          stroke="url(#dailyGradient)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Peak Hours</h3>
                    {(() => {
                      // Find peak hours
                      const sortedHours = [...stats.dailyPatterns].sort((a, b) => b.averageWatchTime - a.averageWatchTime);
                      const peakHours = sortedHours.slice(0, 3);
                      const peakTimeRange = peakHours.map(hour => {
                        const h = hour.hour;
                        return h === 0 ? '12 AM' : 
                               h === 12 ? '12 PM' : 
                               h < 12 ? `${h} AM` : `${h - 12} PM`;
                      }).join(', ');

                      const peakMinutes = Math.round(peakHours[0].averageWatchTime);

                      return (
                        <p className="mt-2 text-sm">
                          Your peak viewing time is around <span className="font-medium">{peakTimeRange}</span>, with an
                          average of <span className="font-medium">{peakMinutes} minutes</span> per day during these hours.
                        </p>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Watch Time Milestones</CardTitle>
                  <CardDescription>Notable achievements in your viewing history</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.milestones ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Longest Single Day</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(stats.milestones.longestSingleDay.date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })} - {stats.milestones.longestSingleDay.watchTime.toFixed(1)} hours
                          </p>
                          <p className="mt-1 text-sm">
                            You watched {stats.milestones.longestSingleDay.videoCount} videos on this day, 
                            mostly {getCategoryName(stats.milestones.longestSingleDay.category || '')} content.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Most Active Month</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(stats.milestones.mostActiveMonth.month).toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })} - {Math.round(stats.milestones.mostActiveMonth.watchTime)} hours
                          </p>
                          <p className="mt-1 text-sm">
                            You watched {stats.milestones.mostActiveMonth.videoCount} videos this month, 
                            {Math.round(stats.milestones.mostActiveMonth.increaseFromAverage)}% more than your monthly average.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Longest Watching Session</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(stats.milestones.longestSession.date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })} - {stats.milestones.longestSession.duration.toFixed(1)} hours continuous
                          </p>
                          <p className="mt-1 text-sm">
                            You watched a series of {getCategoryName(stats.milestones.longestSession.category || '')} videos without significant breaks.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{stats.milestones.totalHoursMilestone.hours} Hour Milestone</h3>
                          <p className="text-sm text-muted-foreground">
                            Reached on {new Date(stats.milestones.totalHoursMilestone.date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="mt-1 text-sm">
                            You've watched over {stats.milestones.totalHoursMilestone.hours} hours of YouTube content in {stats.year}!
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No milestone data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <linearGradient id="dailyGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
