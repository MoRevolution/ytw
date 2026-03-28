"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Calendar,
  Trophy,
  Flame,
  Target,
  GitCompare,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCard, AnimatedStat } from "@/components/animated-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";
import { fetchWatchTimeStats } from "@/lib/fetch-watch-time-data";
import { useAuth } from "@/contexts/auth-context";
import { getCategoryName } from "@/lib/youtube-categories";
import { mockWatchTimeStats } from "@/lib/mock-data";

interface WatchTimeStats {
  totalWatchTime: number;
  averageDailyWatchTime: number;
  averageVideoLength: number;
  dailyWatchTime: {
    date: string;
    watchTime: number;
  }[];
  videoLengthDistribution: {
    length: string;
    count: number;
  }[];
  year: number;
  weeklyPatterns: {
    dayOfWeek: string;
    averageWatchTime: number;
  }[];
  dailyPatterns: {
    hour: number;
    averageWatchTime: number;
  }[];
  previousYearStats?: {
    averageDailyWatchTime: number;
    averageVideoLength: number;
    year: number;
  };
  milestones: {
    longestSingleDay: {
      date: string;
      watchTime: number;
      videoCount: number;
      category?: string;
    };
    mostActiveMonth: {
      month: string;
      watchTime: number;
      videoCount: number;
      increaseFromAverage: number;
    };
    longestSession: {
      date: string;
      duration: number;
      category?: string;
    };
    totalHoursMilestone: {
      hours: number;
      date: string;
    };
  };
}

// Add localStorage cache helpers
const CACHE_KEY_PREFIX = "ytw-stats-";

function getCachedStats(year: number): WatchTimeStats | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${year}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

function setCachedStats(year: number, stats: WatchTimeStats): void {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${year}`, JSON.stringify(stats));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export default function WatchTimePage() {
  const { isLoggedIn, isAuthLoading, isSampleUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<WatchTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(true);

  // Function to convert UTC to Central Time (UTC-6)
  const convertToCentralTime = (date: Date) => {
    const centralDate = new Date(date);
    centralDate.setHours(centralDate.getHours() - 6);
    return centralDate;
  };

  // Function to process watch time data with Central Time
  const processWatchTimeData = (data: WatchTimeStats): WatchTimeStats => {
    return {
      ...data,
      dailyPatterns: data.dailyPatterns.map((pattern) => {
        // Convert the hour to Central Time
        const date = new Date();
        date.setHours(pattern.hour, 0, 0, 0);
        const centralDate = convertToCentralTime(date);
        return {
          hour: centralDate.getHours(),
          averageWatchTime: pattern.averageWatchTime,
        };
      }),
      weeklyPatterns: data.weeklyPatterns.map((pattern) => {
        // Keep the day of week as is since it's relative
        return pattern;
      }),
      milestones: data.milestones || {
        longestSingleDay: {
          date: new Date().toISOString().split("T")[0],
          watchTime: 0,
          videoCount: 0,
        },
        mostActiveMonth: {
          month: new Date().toISOString().split("T")[0].substring(0, 7),
          watchTime: 0,
          videoCount: 0,
          increaseFromAverage: 0,
        },
        longestSession: {
          date: new Date().toISOString().split("T")[0],
          duration: 0,
        },
        totalHoursMilestone: {
          hours: 0,
          date: new Date().toISOString().split("T")[0],
        },
      },
    };
  };

  // Redirect if not logged in (only after auth has finished loading)
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isSampleUser) {
          console.log("[WatchTimePage] Using mock data for sample user");
          setStats(processWatchTimeData(mockWatchTimeStats as WatchTimeStats));
          setIsLoading(false);
          return;
        }

        // Get the most recent complete year (2024 since 2025 is incomplete)
        const currentYear = new Date().getFullYear();
        const yearToAnalyze = currentYear - 1; // Use 2024 since 2025 is incomplete
        console.log(
          "[WatchTimePage] Fetching watch time stats for year:",
          yearToAnalyze,
        );

        // Check cache first
        const cachedStats = getCachedStats(yearToAnalyze);

        if (cachedStats) {
          console.log("[WatchTimePage] Using cached stats");
          setStats(processWatchTimeData(cachedStats));
          setIsLoading(false);
          return;
        }

        const data = await fetchWatchTimeStats(yearToAnalyze);

        // Ensure year is included in the stats
        const statsWithYear: WatchTimeStats = {
          ...data,
          year: yearToAnalyze,
          previousYearStats: data.previousYearStats
            ? {
                ...data.previousYearStats,
                year: yearToAnalyze - 1, // 2023
              }
            : undefined,
        };

        // Cache the stats
        setCachedStats(yearToAnalyze, statsWithYear);

        setStats(processWatchTimeData(statsWithYear));
      } catch (error) {
        console.error(
          "[WatchTimePage] Error fetching watch time stats:",
          error,
        );
        setStats(processWatchTimeData(mockWatchTimeStats as WatchTimeStats));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isSampleUser]);

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
    );
  }

  if (!stats) {
    return (
      <div className="container py-6 md:py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No data available</h2>
          <p className="text-muted-foreground">Please check back later</p>
        </div>
      </div>
    );
  }

  // Calculate equivalent times
  const daysOfContinuousWatching = (stats.totalWatchTime / 24).toFixed(1);
  const workDays = (stats.totalWatchTime / 8).toFixed(1);
  const workWeeks = (stats.totalWatchTime / 40).toFixed(1);

  // Calculate percentage for average daily watch time bar
  const maxDailyWatchTime = 3; // 3 hours
  const dailyWatchTimePercentage = Math.min(
    (stats.averageDailyWatchTime / maxDailyWatchTime) * 100,
    100,
  );

  // Calculate year-over-year changes
  const dailyWatchTimeChange = stats.previousYearStats
    ? calculatePercentageChange(
        stats.averageDailyWatchTime,
        stats.previousYearStats.averageDailyWatchTime,
      )
    : 0;

  const videoLengthChange = stats.previousYearStats
    ? calculatePercentageChange(
        stats.averageVideoLength,
        stats.previousYearStats.averageVideoLength,
      )
    : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 md:py-12">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Watch Time Analysis
                </h1>
                <p className="text-muted-foreground">
                  Detailed breakdown of your YouTube viewing habits in{" "}
                  {stats?.year}
                  {stats?.previousYearStats &&
                    showComparison &&
                    ` compared to ${stats.previousYearStats.year}`}
                  .
                </p>
              </div>
              {stats?.previousYearStats && (
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <Button
                    variant={showComparison ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowComparison(!showComparison)}
                    className="gap-2"
                  >
                    <GitCompare className="h-4 w-4" />
                    {showComparison ? "Hide" : "Show"} Year Comparison
                  </Button>
                  {showComparison && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>
                        Comparison data may be incomplete for partial years
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <AnimatedCard delay={0}>
                <Card className="card-hover card-hero relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-red-500" />
                      Total Watch Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      <AnimatedStat value={Math.round(stats.totalWatchTime)} />
                    </div>
                    <p className="text-xs text-muted-foreground">hours</p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      That's equivalent to:
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                        <span>
                          {daysOfContinuousWatching} days of continuous watching
                        </span>
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
              </AnimatedCard>
              <AnimatedCard delay={100}>
                <Card className="card-hover card-hero relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Average Daily Watch Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      <AnimatedStat
                        value={Math.round(stats.averageDailyWatchTime * 60)}
                        delay={100}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      minutes per day
                    </p>
                    {stats.previousYearStats && showComparison && (
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        {dailyWatchTimeChange > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={
                            dailyWatchTimeChange > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {Math.abs(Math.round(dailyWatchTimeChange))}%
                        </span>
                        <span className="text-muted-foreground">
                          from last year
                        </span>
                      </div>
                    )}
                    <div className="mt-4 h-4 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
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
              </AnimatedCard>
              <AnimatedCard delay={200}>
                <Card className="card-hover card-hero relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      Average Video Length
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      <AnimatedStat
                        value={Math.round(stats.averageVideoLength * 60)}
                        delay={200}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      minutes per video
                    </p>
                    {stats.previousYearStats && showComparison && (
                      <div className="mt-4 flex items-center gap-1 text-sm">
                        {videoLengthChange > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={
                            videoLengthChange > 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {Math.abs(Math.round(videoLengthChange))}%
                        </span>
                        <span className="text-muted-foreground">
                          from last year
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            <div className="mt-8">
              <AnimatedCard delay={300}>
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle>Monthly Watch Time</CardTitle>
                    <CardDescription>
                      How your viewing changed throughout the year
                    </CardDescription>
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
                              data={stats?.dailyWatchTime
                                .reduce((acc, entry) => {
                                  const month = new Date(entry.date).getMonth();
                                  acc[month] =
                                    (acc[month] || 0) + entry.watchTime;
                                  return acc;
                                }, Array(12).fill(0))
                                .map((hours, index) => ({
                                  month: [
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec",
                                  ][index],
                                  hours: Math.round(hours),
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
                              <YAxis
                                label={{
                                  value: "Hours",
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                        <p className="font-medium text-card-foreground">
                                          {label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {Math.round(
                                            payload[0].value as number,
                                          )}{" "}
                                          hours
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar
                                dataKey="hours"
                                fill="url(#monthlyGradient)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                      <TabsContent value="videos">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats?.dailyWatchTime
                                .reduce((acc, entry) => {
                                  const month = new Date(entry.date).getMonth();
                                  acc[month] = (acc[month] || 0) + 1; // Count each day as one video
                                  return acc;
                                }, Array(12).fill(0))
                                .map((count, index) => ({
                                  month: [
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec",
                                  ][index],
                                  videos: count,
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
                              <YAxis
                                label={{
                                  value: "Videos",
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                        <p className="font-medium text-card-foreground">
                                          {label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {Math.round(
                                            payload[0].value as number,
                                          )}{" "}
                                          videos
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar
                                dataKey="videos"
                                fill="url(#monthlyGradient)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                      <TabsContent value="daily">
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats?.dailyWatchTime
                                .reduce(
                                  (acc, entry) => {
                                    const month = new Date(
                                      entry.date,
                                    ).getMonth();
                                    acc[month] = {
                                      total:
                                        (acc[month]?.total || 0) +
                                        entry.watchTime,
                                      count: (acc[month]?.count || 0) + 1,
                                    };
                                    return acc;
                                  },
                                  Array(12).fill({ total: 0, count: 0 }),
                                )
                                .map((monthData, index) => ({
                                  month: [
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec",
                                  ][index],
                                  minutes: Math.round(
                                    (monthData.total / monthData.count) * 60,
                                  ),
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
                              <YAxis
                                label={{
                                  value: "Minutes",
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                        <p className="font-medium text-card-foreground">
                                          {label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {Math.round(
                                            payload[0].value as number,
                                          )}{" "}
                                          minutes/day
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar
                                dataKey="minutes"
                                fill="url(#monthlyGradient)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <AnimatedCard delay={400}>
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle>Weekly Viewing Pattern</CardTitle>
                    <CardDescription>
                      Your average watch time by day of the week
                    </CardDescription>
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
                            label={{
                              value: "Minutes",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                    <p className="font-medium text-card-foreground">
                                      {label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {Math.round(payload[0].value as number)}{" "}
                                      minutes
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
                          const weekendDays = stats.weeklyPatterns.filter(
                            (p) =>
                              p.dayOfWeek === "Saturday" ||
                              p.dayOfWeek === "Sunday",
                          );
                          const weekdays = stats.weeklyPatterns.filter(
                            (p) =>
                              p.dayOfWeek !== "Saturday" &&
                              p.dayOfWeek !== "Sunday",
                          );
                          const weekendAvg =
                            weekendDays.reduce(
                              (sum, day) => sum + day.averageWatchTime,
                              0,
                            ) / weekendDays.length;
                          const weekdayAvg =
                            weekdays.reduce(
                              (sum, day) => sum + day.averageWatchTime,
                              0,
                            ) / weekdays.length;
                          const weekendIncrease = Math.round(
                            ((weekendAvg - weekdayAvg) / weekdayAvg) * 100,
                          );

                          // Find most and least active days
                          const sortedDays = [...stats.weeklyPatterns].sort(
                            (a, b) => b.averageWatchTime - a.averageWatchTime,
                          );
                          const mostActive = sortedDays[0];
                          const leastActive = sortedDays[sortedDays.length - 1];

                          return (
                            <>
                              <li className="flex items-start gap-2">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                                <span>
                                  You watch{" "}
                                  <span className="font-medium">
                                    {weekendIncrease}% more content
                                  </span>{" "}
                                  on weekends compared to weekdays
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                                <span>
                                  {mostActive.dayOfWeek} is your most active day
                                  with an average of{" "}
                                  <span className="font-medium">
                                    {Math.round(mostActive.averageWatchTime)}{" "}
                                    minutes
                                  </span>{" "}
                                  of watch time
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></div>
                                <span>
                                  {leastActive.dayOfWeek} is your least active
                                  day with an average of{" "}
                                  <span className="font-medium">
                                    {Math.round(leastActive.averageWatchTime)}{" "}
                                    minutes
                                  </span>{" "}
                                  of watch time
                                </span>
                              </li>
                            </>
                          );
                        })()}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={500}>
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle>Daily Viewing Pattern</CardTitle>
                    <CardDescription>
                      When you watch YouTube throughout the day
                    </CardDescription>
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
                              if (value === 0) return "12 AM";
                              if (value === 12) return "12 PM";
                              return value < 12
                                ? `${value} AM`
                                : `${value - 12} PM`;
                            }}
                          />
                          <YAxis
                            label={{
                              value: "Minutes",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const hour = label as number;
                                const timeLabel =
                                  hour === 0
                                    ? "12 AM"
                                    : hour === 12
                                      ? "12 PM"
                                      : hour < 12
                                        ? `${hour} AM`
                                        : `${hour - 12} PM`;
                                return (
                                  <div className="rounded-lg border border-border bg-card p-2 shadow-md">
                                    <p className="font-medium text-card-foreground">
                                      {timeLabel}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {Math.round(payload[0].value as number)}{" "}
                                      minutes
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
                        const sortedHours = [...stats.dailyPatterns].sort(
                          (a, b) => b.averageWatchTime - a.averageWatchTime,
                        );
                        const peakHours = sortedHours.slice(0, 3);
                        const peakTimeRange = peakHours
                          .map((hour) => {
                            const h = hour.hour;
                            return h === 0
                              ? "12 AM"
                              : h === 12
                                ? "12 PM"
                                : h < 12
                                  ? `${h} AM`
                                  : `${h - 12} PM`;
                          })
                          .join(", ");

                        const peakMinutes = Math.round(
                          peakHours[0].averageWatchTime,
                        );

                        return (
                          <p className="mt-2 text-sm">
                            Your peak viewing time is around{" "}
                            <span className="font-medium">{peakTimeRange}</span>
                            , with an average of{" "}
                            <span className="font-medium">
                              {peakMinutes} minutes
                            </span>{" "}
                            per day during these hours.
                          </p>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            <div className="mt-8">
              <AnimatedCard delay={600}>
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Watch Time Milestones
                    </CardTitle>
                    <CardDescription>
                      Notable achievements in your viewing history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.milestones ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/20">
                              <Flame className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-red-600 dark:text-red-400">
                                Longest Single Day
                              </h3>
                              <p className="text-2xl font-bold">
                                {stats.milestones.longestSingleDay.watchTime.toFixed(
                                  1,
                                )}
                                h
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {new Date(
                                  stats.milestones.longestSingleDay.date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                • {stats.milestones.longestSingleDay.videoCount}{" "}
                                videos
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-500/20">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                                Most Active Month
                              </h3>
                              <p className="text-2xl font-bold">
                                {Math.round(
                                  stats.milestones.mostActiveMonth.watchTime,
                                )}
                                h
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {new Date(
                                  stats.milestones.mostActiveMonth.month,
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                })}{" "}
                                • +
                                {Math.round(
                                  stats.milestones.mostActiveMonth
                                    .increaseFromAverage,
                                )}
                                % vs avg
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-500/20">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                                Longest Session
                              </h3>
                              <p className="text-2xl font-bold">
                                {stats.milestones.longestSession.duration.toFixed(
                                  1,
                                )}
                                h
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {new Date(
                                  stats.milestones.longestSession.date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                •{" "}
                                {getCategoryName(
                                  stats.milestones.longestSession.category ||
                                    "",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-500/20">
                              <Trophy className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-green-600 dark:text-green-400">
                                {stats.milestones.totalHoursMilestone.hours}h
                                Milestone
                              </h3>
                              <p className="text-2xl font-bold">🎉 Reached!</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {new Date(
                                  stats.milestones.totalHoursMilestone.date,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
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
              </AnimatedCard>
            </div>
          </div>
        </main>
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }}>
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
  );
}
