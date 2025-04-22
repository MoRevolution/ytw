"use client"

import Link from "next/link"
import { BarChart3, Clock, Film, Home, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { ShareStats } from "@/components/share-stats"

// Mock stats for sharing
const userStats = {
  watchTime: 247,
  videosWatched: 1842,
  topCategory: "Gaming",
  topCreator: "MKBHD",
}

export default function WatchTimePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">YouTube Wrapped</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ShareStats
              stats={userStats}
              trigger={
                <Button size="sm" variant="outline">
                  Share Stats
                </Button>
              }
            />
            <UserProfile />
          </div>
        </div>
      </header>
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
              <p className="text-muted-foreground">Detailed breakdown of your YouTube viewing habits in 2023.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Watch Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">hours</p>
                  <div className="mt-2 text-sm text-muted-foreground">That's equivalent to:</div>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span>10.3 days of continuous watching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span>30.9 eight-hour workdays</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span>6.2 40-hour work weeks</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Average Daily Watch Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">40.7</div>
                  <p className="text-xs text-muted-foreground">minutes per day</p>
                  <div className="mt-4 h-4 rounded-full bg-muted">
                    <div className="h-full w-[28%] rounded-full bg-red-500"></div>
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
                  <div className="text-4xl font-bold">8.1</div>
                  <p className="text-xs text-muted-foreground">minutes per video</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="text-green-500 font-medium">+1.3 min</span> compared to 2022
                    </div>
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
                  <Tabs defaultValue="hours">
                    <TabsList className="mb-4">
                      <TabsTrigger value="hours">Hours</TabsTrigger>
                      <TabsTrigger value="videos">Videos</TabsTrigger>
                      <TabsTrigger value="daily">Daily Average</TabsTrigger>
                    </TabsList>
                    <TabsContent value="hours">
                      <div className="h-[300px]">
                        <div className="flex h-full items-end gap-2">
                          {[18, 22, 25, 20, 28, 32, 35, 40, 38, 30, 25, 22].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-red-600 to-red-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 40) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value} hours
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
                    </TabsContent>
                    <TabsContent value="videos">
                      <div className="h-[300px]">
                        <div className="flex h-full items-end gap-2">
                          {[120, 145, 160, 130, 170, 190, 210, 230, 200, 180, 150, 140].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 230) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value} videos
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
                    </TabsContent>
                    <TabsContent value="daily">
                      <div className="h-[300px]">
                        <div className="flex h-full items-end gap-2">
                          {[35, 42, 48, 39, 54, 62, 68, 77, 73, 58, 48, 42].map((value, index) => (
                            <div key={index} className="group relative flex-1">
                              <div
                                className="relative h-full rounded-t-md bg-gradient-to-t from-green-600 to-green-400 transition-all hover:opacity-80"
                                style={{ height: `${(value / 77) * 100}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {value} min/day
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
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Patterns</CardTitle>
                  <CardDescription>Your viewing habits by day of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <div className="flex h-full items-end gap-6">
                      {[42, 38, 35, 40, 45, 68, 75].map((value, index) => (
                        <div key={index} className="group relative flex-1">
                          <div
                            className="relative h-full rounded-t-md bg-gradient-to-t from-purple-600 to-purple-400 transition-all hover:opacity-80"
                            style={{ height: `${(value / 75) * 100}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {value} min avg
                            </div>
                          </div>
                          <div className="mt-2 text-center font-medium">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                          </div>
                          <div className="text-center text-xs text-muted-foreground">{value} min</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Insights</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                        <span>
                          You watch <span className="font-medium">79% more content</span> on weekends compared to
                          weekdays
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                        <span>
                          Sunday is your most active day with an average of{" "}
                          <span className="font-medium">75 minutes</span> of watch time
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                        <span>
                          Wednesday is your least active day with an average of{" "}
                          <span className="font-medium">35 minutes</span> of watch time
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Viewing Pattern</CardTitle>
                  <CardDescription>When you watch YouTube throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <div className="flex h-full items-end gap-1">
                      {[
                        10, 5, 8, 15, 25, 30, 45, 60, 75, 90, 85, 70, 60, 50, 65, 80, 90, 95, 100, 90, 75, 60, 40, 20,
                      ].map((value, index) => (
                        <div key={index} className="group relative flex-1">
                          <div
                            className="relative h-full rounded-t bg-gradient-to-t from-red-600 to-red-400 transition-all hover:opacity-80"
                            style={{ height: `${value}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {Math.round(value * 0.4)} min avg
                            </div>
                          </div>
                          <div className="mt-2 text-center text-xs text-muted-foreground">{index}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>12 AM</span>
                  </div>
                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <h3 className="font-medium">Peak Hours</h3>
                    <p className="mt-2 text-sm">
                      Your peak viewing time is between <span className="font-medium">8 PM and 10 PM</span>, with an
                      average of <span className="font-medium">38 minutes</span> per day during this period.
                    </p>
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
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Longest Single Day</h3>
                        <p className="text-sm text-muted-foreground">July 15, 2023 - 5.2 hours</p>
                        <p className="mt-1 text-sm">You watched 14 videos on this day, mostly gaming content.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Most Active Month</h3>
                        <p className="text-sm text-muted-foreground">August 2023 - 40 hours</p>
                        <p className="mt-1 text-sm">
                          You watched 230 videos this month, 28% more than your monthly average.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Longest Watching Session</h3>
                        <p className="text-sm text-muted-foreground">October 8, 2023 - 3.5 hours continuous</p>
                        <p className="mt-1 text-sm">
                          You watched a series of tech reviews and tutorials without significant breaks.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">250 Hour Milestone</h3>
                        <p className="text-sm text-muted-foreground">Reached on December 28, 2023</p>
                        <p className="mt-1 text-sm">You've watched over 250 hours of YouTube content in 2023!</p>
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
