"use client"

import { useState, useEffect } from "react"
import { fetchDefaultComparison, DashboardStats } from "@/lib/fetch-dashboard-data"

const CACHE_KEY = "dashboardStats"
const CACHE_TIMESTAMP_KEY = "dashboardStatsTimestamp"
const CACHE_VERSION_KEY = "dashboardStatsVersion"
const CACHE_VERSION = "v5"
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

export interface DashboardStatsResult {
  primaryYear: DashboardStats
  comparisonYear?: DashboardStats
}

interface UseDashboardStatsOptions {
  enabled: boolean
  useMockData?: boolean
  mockData?: DashboardStatsResult | null
}

interface UseDashboardStatsReturn {
  stats: DashboardStatsResult | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  clearCache: () => void
}

function getCache(): DashboardStatsResult | null {
  if (typeof window === "undefined") return null
  
  try {
    const cachedData = localStorage.getItem(CACHE_KEY)
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY)
    
    if (!cachedData || !cachedTimestamp || cachedVersion !== CACHE_VERSION) {
      return null
    }
    
    const now = Date.now()
    if (now - parseInt(cachedTimestamp) >= CACHE_DURATION) {
      return null
    }
    
    return JSON.parse(cachedData)
  } catch {
    clearCache()
    return null
  }
}

function setCache(data: DashboardStatsResult): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION)
  } catch (error) {
    console.error("Failed to cache dashboard stats:", error)
  }
}

function clearCache(): void {
  if (typeof window === "undefined") return
  
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_TIMESTAMP_KEY)
  localStorage.removeItem(CACHE_VERSION_KEY)
}

export function useDashboardStats({
  enabled,
  useMockData = false,
  mockData = null,
}: UseDashboardStatsOptions): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStatsResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = async () => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    // Use mock data for sample users
    if (useMockData && mockData) {
      setStats(mockData)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check cache first
      const cached = getCache()
      if (cached) {
        console.log("📊 Using cached dashboard stats")
        setStats(cached)
        setIsLoading(false)
        return
      }

      // Fetch fresh data
      console.log("🔄 Fetching new dashboard stats...")
      const data = await fetchDefaultComparison()
      
      // Validate data before caching
      JSON.parse(JSON.stringify(data))
      
      setStats(data)
      setCache(data)
      console.log("✅ Dashboard stats loaded and cached")
    } catch (err) {
      console.error("❌ Error fetching dashboard stats:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch stats"))
      
      // Fallback to mock data if available
      if (mockData) {
        console.log("⚠️ Using mock stats as fallback")
        setStats(mockData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [enabled, useMockData])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
    clearCache,
  }
}
