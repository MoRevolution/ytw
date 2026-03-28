"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Play,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Layers,
  BarChart3,
  Film,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedCard, AnimatedStat } from "@/components/animated-card";
import { useAuth } from "@/contexts/auth-context";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sidebar } from "@/components/sidebar";
import { fetchCategoryData } from "@/lib/fetch-categories-data";
import { getCategoryName } from "@/lib/youtube-categories";
import { mockCategoryData } from "@/lib/mock-data";

interface CategoryData {
  year: number;
  totalWatchTime: number;
  categoryDistribution: {
    categoryId: string;
    watchTime: number;
    videoCount: number;
    percentage: number;
    topVideos: {
      videoId: string;
      title: string;
      channelTitle: string;
      watchCount: number;
      duration: number;
    }[];
  }[];
  categoryComparison: {
    categoryId: string;
    currentYear: {
      watchTime: number;
      percentage: number;
    };
    previousYear: {
      watchTime: number;
      percentage: number;
    };
    change: number;
  }[];
  monthlyBreakdown?: {
    month: string;
    [categoryId: string]: number | string;
  }[];
}

// Add localStorage cache helpers
const CACHE_KEY_PREFIX = "ytw-categories-";

function getCachedData(year: number): CategoryData | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${year}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

function setCachedData(year: number, data: CategoryData): void {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${year}`, JSON.stringify(data));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

export default function CategoriesPage() {
  const { isLoggedIn, isAuthLoading, isSampleUser } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(
    new Set(),
  );

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
          setData(mockCategoryData);
          setIsLoading(false);
          return;
        }

        // Get the most recent complete year
        const currentYear = new Date().getFullYear();
        const yearToAnalyze = currentYear - 1; // Use previous year since current year is incomplete

        // Check cache first
        const cachedData = getCachedData(yearToAnalyze);

        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          return;
        }

        const categoryData = await fetchCategoryData(yearToAnalyze);
        setCachedData(yearToAnalyze, categoryData);
        setData(categoryData);
      } catch (error) {
        console.error("[CategoriesPage] Error fetching category data:", error);
        setData(mockCategoryData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isSampleUser]);

  // If not logged in, don't render the page content
  if (!isLoggedIn) {
    return null;
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
    );
  }

  if (!data) {
    return (
      <div className="container py-6 md:py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No data available</h2>
          <p className="text-muted-foreground">Please check back later</p>
        </div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    "20": "bg-red-500",
    "28": "bg-blue-500",
    "10": "bg-green-500",
    "27": "bg-yellow-500",
    "24": "bg-purple-500",
  };

  const chartColors: Record<string, string> = {
    "20": "#ef4444",
    "28": "#3b82f6",
    "10": "#22c55e",
    "27": "#eab308",
    "24": "#a855f7",
  };

  // Radar chart data — current vs previous year percentages
  const radarData = data.categoryComparison.map((comp) => ({
    category: getCategoryName(comp.categoryId),
    [String(data.year)]: Math.round(comp.currentYear.percentage),
    [String(data.year - 1)]: Math.round(comp.previousYear.percentage),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 md:py-12">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Category Analysis
              </h1>
              <p className="text-muted-foreground">
                Breakdown of your YouTube viewing by category in {data.year}
                {data.categoryComparison[0]?.previousYear.percentage > 0 &&
                  ` compared to ${data.year - 1}`}
              </p>
            </div>

            {/* ── Hero: Category Evolution ── */}
            {data.monthlyBreakdown && data.monthlyBreakdown.length > 0 && (
              <AnimatedCard delay={0}>
                <Card className="card-hover card-hero relative overflow-hidden mb-8">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-500" />
                      Category Evolution
                    </CardTitle>
                    <CardDescription>
                      How your interests shifted throughout {data.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={data.monthlyBreakdown.map((row) => {
                            const filtered = { ...row };
                            hiddenCategories.forEach((id) => {
                              filtered[id] = 0;
                            });
                            return filtered;
                          })}
                          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                        >
                          <defs>
                            {data.categoryDistribution.map((cat) => (
                              <linearGradient
                                key={cat.categoryId}
                                id={`grad-${cat.categoryId}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={
                                    chartColors[cat.categoryId] || "#888"
                                  }
                                  stopOpacity={0.4}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={
                                    chartColors[cat.categoryId] || "#888"
                                  }
                                  stopOpacity={0.05}
                                />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            opacity={0.3}
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="hsl(var(--muted-foreground))"
                            tickFormatter={(v) => `${v}h`}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              const visible = payload.filter(
                                (p) =>
                                  !hiddenCategories.has(p.dataKey as string),
                              );
                              const total = visible.reduce(
                                (sum, p) => sum + (Number(p.value) || 0),
                                0,
                              );
                              return (
                                <div className="rounded-lg border bg-card p-3 shadow-lg">
                                  <p className="mb-2 font-medium">{label}</p>
                                  {visible.map((entry) => (
                                    <div
                                      key={entry.dataKey}
                                      className="flex items-center justify-between gap-6 text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{
                                            backgroundColor: entry.color,
                                          }}
                                        />
                                        <span className="text-muted-foreground">
                                          {getCategoryName(
                                            entry.dataKey as string,
                                          )}
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        {Number(entry.value).toFixed(1)}h
                                      </span>
                                    </div>
                                  ))}
                                  <div className="mt-2 border-t pt-2 flex justify-between text-sm font-medium">
                                    <span>Total</span>
                                    <span>{total.toFixed(1)}h</span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          {data.categoryDistribution.map((cat) => (
                            <Area
                              key={cat.categoryId}
                              type="monotone"
                              dataKey={cat.categoryId}
                              stackId="1"
                              stroke={
                                hiddenCategories.has(cat.categoryId)
                                  ? "transparent"
                                  : chartColors[cat.categoryId] || "#888"
                              }
                              fill={
                                hiddenCategories.has(cat.categoryId)
                                  ? "transparent"
                                  : `url(#grad-${cat.categoryId})`
                              }
                              strokeWidth={2}
                              activeDot={
                                hiddenCategories.has(cat.categoryId)
                                  ? false
                                  : {
                                      r: 5,
                                      stroke:
                                        chartColors[cat.categoryId] || "#888",
                                      strokeWidth: 2,
                                      fill: "hsl(var(--card))",
                                    }
                              }
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {data.categoryDistribution.map((cat) => {
                        const isHidden = hiddenCategories.has(cat.categoryId);
                        return (
                          <button
                            key={cat.categoryId}
                            onClick={() => {
                              setHiddenCategories((prev) => {
                                const next = new Set(prev);
                                if (next.has(cat.categoryId))
                                  next.delete(cat.categoryId);
                                else next.add(cat.categoryId);
                                return next;
                              });
                            }}
                            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-all ${
                              isHidden
                                ? "border-muted bg-muted/50 text-muted-foreground line-through opacity-50"
                                : "border-border bg-card hover:bg-muted"
                            }`}
                          >
                            <div
                              className={`h-2.5 w-2.5 rounded-full transition-opacity ${isHidden ? "opacity-30" : ""}`}
                              style={{
                                backgroundColor:
                                  chartColors[cat.categoryId] || "#888",
                              }}
                            />
                            {getCategoryName(cat.categoryId)}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* ── Category Distribution ── */}
              <AnimatedCard delay={100} className="h-full">
                <Card className="card-hover card-hero relative overflow-hidden h-full">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-500" />
                      Category Distribution
                    </CardTitle>
                    <CardDescription>
                      Percentage of watch time by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.categoryDistribution.map((category, index) => (
                        <div key={category.categoryId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-3 w-3 rounded-full ${categoryColors[category.categoryId] || "bg-gray-500"}`}
                              ></div>
                              <span className="font-medium">
                                {getCategoryName(category.categoryId)}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              <AnimatedStat
                                value={Math.round(category.percentage)}
                                delay={index * 50}
                              />
                              %
                            </span>
                          </div>
                          <Progress
                            value={category.percentage}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {Math.round(category.watchTime)} hours (
                            {category.videoCount} videos)
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* ── Year-over-Year Radar ── */}
              <AnimatedCard delay={200} className="h-full">
                <Card className="card-hover card-hero relative overflow-hidden h-full">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      Year-over-Year
                    </CardTitle>
                    <CardDescription>
                      How your interests changed from {data.year - 1}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} outerRadius="70%">
                          <PolarGrid
                            stroke="hsl(var(--border))"
                            opacity={0.4}
                          />
                          <PolarAngleAxis
                            dataKey="category"
                            tick={{
                              fontSize: 11,
                              fill: "hsl(var(--muted-foreground))",
                            }}
                          />
                          <PolarRadiusAxis
                            tick={{ fontSize: 10 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <Radar
                            name={String(data.year)}
                            dataKey={String(data.year)}
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.25}
                            strokeWidth={2}
                          />
                          <Radar
                            name={String(data.year - 1)}
                            dataKey={String(data.year - 1)}
                            stroke="#64748b"
                            fill="#64748b"
                            fillOpacity={0.1}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                          />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                            formatter={(value: number) => [`${value}%`]}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 space-y-1">
                      {data.categoryComparison.map((comp) => (
                        <div
                          key={comp.categoryId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {getCategoryName(comp.categoryId)}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-medium ${comp.change > 0 ? "text-green-500" : comp.change < 0 ? "text-red-500" : "text-muted-foreground"}`}
                          >
                            {comp.change > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : comp.change < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {comp.change > 0 ? "+" : ""}
                            {Math.round(comp.change)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* ── Bottom row: Top Videos + Discoveries ── */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.categoryDistribution.slice(0, 2).map((category, i) => (
                <AnimatedCard
                  key={category.categoryId}
                  delay={300 + i * 100}
                  className="h-full"
                >
                  <Card className="card-hover relative overflow-hidden h-full">
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${i === 0 ? "from-red-500/5" : "from-blue-500/5"} via-transparent to-transparent`}
                    />
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Film
                          className={`h-4 w-4 ${i === 0 ? "text-red-500" : "text-blue-500"}`}
                        />
                        Top {getCategoryName(category.categoryId)} Videos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.topVideos?.map((video) => (
                          <a
                            key={video.videoId}
                            href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.videoId)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative h-[90px] w-[160px] shrink-0 overflow-hidden rounded-md bg-muted group">
                                <Image
                                  src={`https://img.youtube.com/vi/${encodeURIComponent(video.videoId)}/mqdefault.jpg`}
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
                                <p className="font-medium line-clamp-2 hover:text-primary transition-colors">
                                  {video.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {video.channelTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Watched {video.watchCount}{" "}
                                  {video.watchCount === 1 ? "time" : "times"}
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
              <AnimatedCard delay={500} className="h-full">
                <Card className="card-hover relative overflow-hidden h-full">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Category Discoveries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                          <h3 className="font-medium">New Categories</h3>
                        </div>
                        <p className="mt-2 text-sm">
                          In {data.year}, you started watching these categories
                          that you rarely watched before:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm">
                          {data.categoryComparison
                            .filter((comp) => comp.change > 0)
                            .slice(0, 3)
                            .map((comp) => (
                              <li
                                key={comp.categoryId}
                                className="flex items-center gap-2"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
                                <span>
                                  {getCategoryName(comp.categoryId)} (+
                                  {Math.round(comp.change)}%)
                                </span>
                              </li>
                            ))}
                          {data.categoryComparison.filter(
                            (comp) => comp.change > 0,
                          ).length === 0 && (
                            <li className="text-muted-foreground">
                              No significant new categories this year
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <h3 className="font-medium">Category Diversity</h3>
                        </div>
                        <p className="mt-2 text-sm">
                          Your content diversity score is{" "}
                          <span className="font-medium">
                            {Math.round(
                              (data.categoryDistribution.length / 5) * 100,
                            )}
                            /100
                          </span>
                          , which means you watch a good variety of content
                          across different categories.
                        </p>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/20">
                          <div
                            className="h-full rounded-full bg-yellow-500"
                            style={{
                              width: `${(data.categoryDistribution.length / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
