"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart2, Clock, Play, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { isLoggedIn, login, viewSampleUser } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">YouTube Wrapped</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:underline">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserProfile />
            {!isLoggedIn ? (
              <Button onClick={login}>Get Started</Button>
            ) : (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32 space-y-8">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Discover Your <span className="text-red-500">YouTube</span> Year in Review
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Explore your viewing habits, favorite creators, and most-watched categories in a beautiful, shareable
              format.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  See Your Wrapped <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#sample">
                <Button size="lg" variant="outline" onClick={() => viewSampleUser()}>
                  View Sample
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border bg-background p-2">
              <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-lg p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">Watch Time</h3>
                  <p className="text-3xl font-bold">247 hours</p>
                  <p className="text-sm text-muted-foreground">That's 10.3 days of continuous watching!</p>
                  <div className="mt-4 h-32 w-full">
                    <div className="flex h-full items-end gap-2">
                      <div className="w-1/12 h-[20%] bg-red-200 rounded-t-md"></div>
                      <div className="w-1/12 h-[30%] bg-red-300 rounded-t-md"></div>
                      <div className="w-1/12 h-[45%] bg-red-400 rounded-t-md"></div>
                      <div className="w-1/12 h-[60%] bg-red-500 rounded-t-md"></div>
                      <div className="w-1/12 h-[80%] bg-red-600 rounded-t-md"></div>
                      <div className="w-1/12 h-[95%] bg-red-700 rounded-t-md"></div>
                      <div className="w-1/12 h-[85%] bg-red-600 rounded-t-md"></div>
                      <div className="w-1/12 h-[70%] bg-red-500 rounded-t-md"></div>
                      <div className="w-1/12 h-[50%] bg-red-400 rounded-t-md"></div>
                      <div className="w-1/12 h-[35%] bg-red-300 rounded-t-md"></div>
                      <div className="w-1/12 h-[25%] bg-red-200 rounded-t-md"></div>
                      <div className="w-1/12 h-[15%] bg-red-100 rounded-t-md"></div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Jan - Dec 2023</div>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border bg-background p-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">Top Categories</h3>
                  <div className="mt-4 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Gaming</span>
                        <span className="font-medium">32%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[32%] rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Tech</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[28%] rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Music</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[18%] rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Education</span>
                        <span className="font-medium">12%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[12%] rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Entertainment</span>
                        <span className="font-medium">10%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[10%] rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Discover Your YouTube Journey</h2>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              YouTube Wrapped gives you insights into your viewing habits that you never knew existed.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-background p-6 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <Clock className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold">Watch Time Analytics</h3>
              <p className="text-muted-foreground">
                See how many hours you've spent watching videos and how it changed throughout the year.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-background p-6 text-center">
              <div className="rounded-full bg-purple-100 p-3">
                <BarChart2 className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold">Category Breakdown</h3>
              <p className="text-muted-foreground">
                Discover which video categories you watched the most and how diverse your interests are.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-background p-6 text-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Creator Insights</h3>
              <p className="text-muted-foreground">
                Find out which creators you supported the most with your viewing time.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Getting your YouTube Wrapped is simple and secure.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-background p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Connect Your Account</h3>
              <p className="text-muted-foreground">Securely connect your YouTube account with just a few clicks.</p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-background p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">We Analyze Your Data</h3>
              <p className="text-muted-foreground">
                Our algorithms analyze your watch history to generate personalized insights.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-background p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Get Your Wrapped</h3>
              <p className="text-muted-foreground">View your personalized YouTube Wrapped and share it with friends.</p>
            </div>
          </div>
        </section>

        <section id="testimonials" className="container py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What Users Say</h2>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Join thousands of YouTube enthusiasts who have discovered their viewing habits.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
              <div className="flex gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-muted-foreground">
                "I was shocked to see how much time I spent watching tech reviews! YouTube Wrapped helped me become more
                mindful of my viewing habits."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Alex Johnson</p>
                  <p className="text-xs text-muted-foreground">Tech Enthusiast</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
              <div className="flex gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-muted-foreground">
                "Sharing my YouTube Wrapped with friends was so fun! We compared our top creators and had a great laugh
                about our different tastes."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Samantha Lee</p>
                  <p className="text-xs text-muted-foreground">Content Creator</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-lg border bg-background p-6">
              <div className="flex gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-muted-foreground">
                "As a parent, YouTube Wrapped helped me understand what my kids are watching and sparked great
                conversations about digital habits."
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Michael Torres</p>
                  <p className="text-xs text-muted-foreground">Parent & Educator</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Unwrap Your YouTube Year?
            </h2>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Join thousands of users who have already discovered their YouTube Wrapped.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="mt-4">
                Get Your YouTube Wrapped
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-red-500" />
            <span className="font-semibold">YouTube Wrapped</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} YouTube Wrapped. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
