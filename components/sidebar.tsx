"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Clock, BarChart3, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, shortcut: "D" },
  { href: "/dashboard/watch-time", label: "Watch Time", icon: Clock, shortcut: "W" },
  { href: "/dashboard/categories", label: "Categories", icon: BarChart3, shortcut: "C" },
  { href: "/dashboard/creators", label: "Creators", icon: Users, shortcut: "R" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed")
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState))
      return newState
    })
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Alt + B to toggle sidebar
      if (e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggleCollapsed()
        return
      }

      // Alt + letter for navigation
      if (e.altKey) {
        const key = e.key.toUpperCase()
        const item = navItems.find(nav => nav.shortcut === key)
        if (item) {
          e.preventDefault()
          router.push(item.href)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleCollapsed, router])

  return (
    <aside
      className={cn(
        "hidden flex-col border-r bg-background md:flex transition-all duration-150 ease-out h-[calc(100vh-64px)] sticky top-[64px]",
        isCollapsed ? "w-[60px]" : "w-[250px]"
      )}
    >
      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? `${item.label} (Alt+${item.shortcut})` : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{item.label}</span>
                  <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    Alt+{item.shortcut}
                  </kbd>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle button - at bottom */}
      <button
        onClick={toggleCollapsed}
        className="flex items-center justify-center gap-2 h-10 hover:bg-muted/50 transition-colors mx-2 mb-3 rounded-lg border border-border"
        aria-label={isCollapsed ? "Expand sidebar (Alt+B)" : "Collapse sidebar (Alt+B)"}
        title={`${isCollapsed ? "Expand" : "Collapse"} sidebar (Alt+B)`}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              Alt+B
            </kbd>
          </>
        )}
      </button>
    </aside>
  )
}
