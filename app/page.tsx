"use client"

import Link from "next/link"
import { ArrowRight, BarChart2, Clock, Play, Users, Sparkles, Download, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { isLoggedIn, login, viewSampleUser } = useAuth()

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement> | null, sectionId: string) => {
    if (e) e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Play className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold">YouTube Wrapped</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, 'features')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <Link href="/takeout-instructions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Takeout Guide
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserProfile />
            {!isLoggedIn ? (
              <Button onClick={() => scrollToSection(null, 'how-it-works')} className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button className="gap-2">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="container relative py-20 md:py-32 lg:py-40">
            <div className="mx-auto flex max-w-[64rem] flex-col items-center justify-center gap-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium bg-background/50 backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" />
                Your 2025 YouTube stats are ready
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Discover Your{" "}
                <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent">
                  YouTube
                </span>{" "}
                Year in Review
              </h1>
              
              <p className="max-w-[42rem] text-lg text-muted-foreground md:text-xl">
                See your watch time, favorite creators, and viewing patterns — 
                all wrapped up in a beautiful, shareable format. 
                <span className="text-foreground/80"> No judgment, we promise 😜</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" className="gap-2 text-base px-8" onClick={() => isLoggedIn ? window.location.href = '/dashboard' : scrollToSection(null, 'how-it-works')}>
                  {isLoggedIn ? 'View Your Wrapped' : 'Get Started'} <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base px-8" onClick={() => viewSampleUser()}>
                  <Play className="h-4 w-4" /> View Demo
                </Button>
              </div>
            </div>

            {/* Preview Cards */}
            <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    Watch Time
                  </div>
                  <p className="text-4xl font-bold">247<span className="text-2xl text-muted-foreground ml-1">hrs</span></p>
                  <p className="text-sm text-muted-foreground mt-2">That&apos;s 10.3 days of videos!</p>
                  <div className="mt-4 flex gap-1 h-16 items-end">
                    {[20, 35, 55, 70, 85, 95, 80, 65, 45, 30, 20, 15].map((h, i) => (
                      <div key={i} className="flex-1 bg-red-500/20 rounded-t" style={{ height: `${h}%` }}>
                        <div className="w-full bg-red-500 rounded-t transition-all group-hover:bg-red-400" style={{ height: `${h * 0.7}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <BarChart2 className="h-4 w-4" />
                    Top Category
                  </div>
                  <p className="text-4xl font-bold">Gaming</p>
                  <p className="text-sm text-muted-foreground mt-2">32% of your watch time</p>
                  <div className="mt-4 space-y-2">
                    {[{ name: 'Gaming', pct: 32 }, { name: 'Tech', pct: 28 }, { name: 'Music', pct: 18 }].map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div className="w-16 text-xs text-muted-foreground">{cat.name}</div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all group-hover:bg-purple-400" style={{ width: `${cat.pct}%` }} />
                        </div>
                        <div className="w-8 text-xs text-right">{cat.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="h-4 w-4" />
                    Top Creator
                  </div>
                  <p className="text-4xl font-bold">MKBHD</p>
                  <p className="text-sm text-muted-foreground mt-2">42.3 hours watched</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[
                        { name: 'MKBHD', img: 'https://yt3.ggpht.com/qu4TmIaYUlS41-dJ9gZ7DUR3nilvmB5_11i6OKSdvNnBNiyOusZP1bMN6ICnuxtjFBb6ioKgRQ=s88-c-k-c0x00ffffff-no-rj' },
                        { name: 'Veritasium', img: 'https://yt3.googleusercontent.com/7vCbvtCqtjQ3YLgsJt7Y952MQV1sBvhllSCSxHP8_sVZdcPCBrITfhkN2RdyCuwPnsByq-1GoA=s160-c-k-c0x00ffffff-no-rj' },
                        { name: 'PewDiePie', img: 'https://yt3.googleusercontent.com/vik8mAiwHQbXiFyKfZ3__p55_VBdGvwxPpuPJBBwdbF0PjJxikXhrP-C3nLQAMAxGNd_-xQCIg=s160-c-k-c0x00ffffff-no-rj' },
                        { name: 'The PrimeTime', img: 'https://yt3.googleusercontent.com/Eu_xR4JfLlrruwj1lrmfDiOpe8GARBs8M0hgQ6NsGhQ0qC8S-po9HEHw1W21sPN2BHO6EHXrSwM=s160-c-k-c0x00ffffff-no-rj' },
                        { name: 'Good Work', img: 'https://yt3.googleusercontent.com/Uj7Ky8T7owxiMSQCDLeEaeD-x0rJYkt7e4iqIo8Q8SV3d0yB1UWxo68O4N7Hstmjh-j1J2X3=s160-c-k-c0x00ffffff-no-rj' },
                      ].map((creator) => (
                        <img 
                          key={creator.name} 
                          src={creator.img} 
                          alt={creator.name}
                          className="w-8 h-8 rounded-full border-2 border-card object-cover" 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">+307 creators</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-20 md:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything You Need to Know
            </h2>
            <p className="max-w-[42rem] text-muted-foreground text-lg">
              Deep insights into your YouTube viewing habits, all in one place.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full" />
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <Clock className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold">Watch Time Analytics</h3>
              <p className="text-muted-foreground">
                See exactly how many hours you&apos;ve spent watching videos and track trends throughout the year.
              </p>
            </div>
            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <BarChart2 className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold">Category Breakdown</h3>
              <p className="text-muted-foreground">
                Discover which video categories dominate your feed and how diverse your interests really are.
              </p>
            </div>
            <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Creator Insights</h3>
              <p className="text-muted-foreground">
                Find out which creators you&apos;ve supported the most with your precious viewing time.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
          <div className="container">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[42rem] text-muted-foreground text-lg">
                Get your personalized YouTube Wrapped in just 3 simple steps
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group relative flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Required
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                  1
                </div>
                <h3 className="text-xl font-bold">Export Your Data</h3>
                <p className="text-muted-foreground text-sm">
                  Get your YouTube watch history from Google Takeout. It&apos;s easy, we promise!
                </p>
                <Link href="/takeout-instructions" className="mt-auto">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Get Instructions
                  </Button>
                </Link>
              </div>
              
              <div className="group flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                  2
                </div>
                <h3 className="text-xl font-bold">Connect Account</h3>
                <p className="text-muted-foreground text-sm">
                  Sign in with Google to securely access and process your data. We pinky promise not to peek 👀
                </p>
                <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>100% Private</span>
                </div>
              </div>
              
              <div className="group flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform">
                  3
                </div>
                <h3 className="text-xl font-bold">Get Your Wrapped</h3>
                <p className="text-muted-foreground text-sm">
                  View your personalized stats and share them with friends. Bragging rights included!
                </p>
                <div className="mt-auto">
                  <Link href="/login">
                    <Button className="gap-2">
                      {isLoggedIn ? 'Go to Dashboard' : 'Login'} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              <span className="font-semibold">YouTube Wrapped</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} YouTube Wrapped. Not affiliated with YouTube or Google.
            </p>
            <div className="flex gap-6">
              <Link href="/terms-and-privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy & Terms
              </Link>
              <Link href="/takeout-instructions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
