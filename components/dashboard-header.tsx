import { Film } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShareStats } from "@/components/share-stats"
import { UserProfile } from "@/components/user-profile"

// Temporary mock stats until IndexedDB integration
const mockStats = {
  watchTime: 0,
  videosWatched: 0,
  topCategory: "",
  topCreator: "",
}

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">YouTube Wrapped</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ShareStats stats={mockStats} />
          <UserProfile />
        </div>
      </div>
    </header>
  )
} 