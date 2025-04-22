import Link from "next/link"
import Image from "next/image"
import { BarChart3, Clock, Film, Home, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CreatorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold">YouTube Wrapped</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" variant="outline">
              Share Stats
            </Button>
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
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Creators</CardTitle>
                  <CardDescription>Channels you watched the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                          <p className="font-medium">MKBHD</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">42.3 hours</span>
                          </div>
                        </div>
                        <Progress value={85} className="mt-2 h-2" />
                      </div>
                    </div>
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
                          <p className="font-medium">Linus Tech Tips</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">38.7 hours</span>
                          </div>
                        </div>
                        <Progress value={78} className="mt-2 h-2" />
                      </div>
                    </div>
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
                          <p className="font-medium">Veritasium</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">29.5 hours</span>
                          </div>
                        </div>
                        <Progress value={60} className="mt-2 h-2" />
                      </div>
                    </div>
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
                          <p className="font-medium">Fireship</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">24.8 hours</span>
                          </div>
                        </div>
                        <Progress value={50} className="mt-2 h-2" />
                      </div>
                    </div>
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
                          <p className="font-medium">PewDiePie</p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">18.2 hours</span>
                          </div>
                        </div>
                        <Progress value={37} className="mt-2 h-2" />
                      </div>
                    </div>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span>Tech Reviewers</span>
                        </div>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                      <div className="text-xs text-muted-foreground">MKBHD, Linus Tech Tips, Unbox Therapy</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <span>Gaming</span>
                        </div>
                        <span className="text-sm font-medium">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                      <div className="text-xs text-muted-foreground">PewDiePie, Ninja, Dream</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span>Educational</span>
                        </div>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                      <div className="text-xs text-muted-foreground">Veritasium, Kurzgesagt, TED-Ed</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                          <span>Programming</span>
                        </div>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                      <Progress value={12} className="h-2" />
                      <div className="text-xs text-muted-foreground">Fireship, Traversy Media, Web Dev Simplified</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                          <span>Music</span>
                        </div>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                      <Progress value={5} className="h-2" />
                      <div className="text-xs text-muted-foreground">Various artists and music channels</div>
                    </div>
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
                    <TabsContent value="q1">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Kurzgesagt</p>
                            <p className="text-xs text-muted-foreground">Educational</p>
                            <p className="text-xs text-muted-foreground">Discovered Jan 15</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Fireship</p>
                            <p className="text-xs text-muted-foreground">Programming</p>
                            <p className="text-xs text-muted-foreground">Discovered Feb 3</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="q2">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Web Dev Simplified</p>
                            <p className="text-xs text-muted-foreground">Programming</p>
                            <p className="text-xs text-muted-foreground">Discovered Apr 22</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Binging with Babish</p>
                            <p className="text-xs text-muted-foreground">Cooking</p>
                            <p className="text-xs text-muted-foreground">Discovered May 17</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="q3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Dream</p>
                            <p className="text-xs text-muted-foreground">Gaming</p>
                            <p className="text-xs text-muted-foreground">Discovered Jul 8</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Traversy Media</p>
                            <p className="text-xs text-muted-foreground">Programming</p>
                            <p className="text-xs text-muted-foreground">Discovered Aug 29</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="q4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">TED-Ed</p>
                            <p className="text-xs text-muted-foreground">Educational</p>
                            <p className="text-xs text-muted-foreground">Discovered Oct 12</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border p-4">
                          <div className="h-12 w-12 rounded-full bg-muted">
                            <Image
                              src="/placeholder.svg?height=48&width=48"
                              alt="Creator avatar"
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Theo - t3.gg</p>
                            <p className="text-xs text-muted-foreground">Programming</p>
                            <p className="text-xs text-muted-foreground">Discovered Nov 5</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
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
                          <p className="font-medium">MKBHD</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">95%</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Watched 38 out of 40 uploads</p>
                        <Progress value={95} className="mt-2 h-2" />
                      </div>
                    </div>
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
                          <p className="font-medium">Veritasium</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">88%</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Watched 22 out of 25 uploads</p>
                        <Progress value={88} className="mt-2 h-2" />
                      </div>
                    </div>
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
                          <p className="font-medium">Fireship</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">75%</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Watched 45 out of 60 uploads</p>
                        <Progress value={75} className="mt-2 h-2" />
                      </div>
                    </div>
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
                            src="/placeholder.svg?height=48&width=48"
                            alt="Creator avatar"
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">MKBHD</p>
                          <p className="text-xs text-muted-foreground">You liked 35 videos</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium">Most Commented Creator</h3>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted">
                          <Image
                            src="/placeholder.svg?height=48&width=48"
                            alt="Creator avatar"
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Fireship</p>
                          <p className="text-xs text-muted-foreground">You commented on 12 videos</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="font-medium">Most Shared Creator</h3>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted">
                          <Image
                            src="/placeholder.svg?height=48&width=48"
                            alt="Creator avatar"
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Veritasium</p>
                          <p className="text-xs text-muted-foreground">You shared 8 videos</p>
                        </div>
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
