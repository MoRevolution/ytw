import { Film } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShareStats } from "@/components/share-stats"
import { UserProfile } from "@/components/user-profile"
import { useState, useEffect } from "react"

export function DashboardHeader() {
  const [stats, setStats] = useState<{
    watchTime: number
    videosWatched: number
    topCategory: string
    topCreator: string
  } | null>(null)

  useEffect(() => {
    // Read from cache
    const cachedData = localStorage.getItem('dashboardStats')
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        setStats({
          watchTime: parseFloat((parsedData.primaryYear.watchTime || 0).toFixed(1)),
          videosWatched: parsedData.primaryYear.videosWatched || 0,
          topCategory: parsedData.primaryYear.topCategory || "Unknown",
          topCreator: parsedData.primaryYear.topCreator || "Unknown"
        })
      } catch (error) {
        console.error('Error parsing cached data:', error)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">YouTube Wrapped</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ShareStats 
            stats={stats || {
              watchTime: 247,
              videosWatched: 1842,
              topCategory: "Gaming",
              topCreator: "MKBHD"
            }}
            iconOnly={true}
          />
          <UserProfile />
        </div>
      </div>
    </header>
  )
}