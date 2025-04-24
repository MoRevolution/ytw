import { openDB } from "idb"
import { DB_NAME, FILES_STORE } from './constants'

interface WatchHistoryEntry {
  channel_name: string
  time_watched: string
  video_title: string
}

interface CreatorStats {
  name: string
  watchTime: number
  videoCount: number
}

export interface DashboardStats {
  watchTime: number
  videosWatched: number
  uniqueCreators: number
  topCategory: string
  topCreator: string
  year: number
  isComplete: boolean
  topCreators: CreatorStats[]
  monthlyVideoCounts: number[]
  mostWatchedVideo: {
    title: string
    count: number
    channel: string
  }
}

export interface YearComparison {
  primaryYear: DashboardStats
  comparisonYear?: DashboardStats
}

export async function fetchAvailableYears(): Promise<number[]> {
  const db = await openDB(DB_NAME, 1)
  const tx = db.transaction(FILES_STORE, "readonly")
  const store = tx.objectStore(FILES_STORE)
  
  const currentYear = new Date().getFullYear()
  const years = []
  
  // Check for data from current year back to 2020
  for (let year = currentYear; year >= 2020; year--) {
    const data = await store.get(`watch-history-${year}`)
    if (data) {
      years.push(year)
    }
  }
  
  return years
}

export async function fetchYearStats(year: number): Promise<DashboardStats> {
  const db = await openDB(DB_NAME, 1)
  const tx = db.transaction(FILES_STORE, "readonly")
  const store = tx.objectStore(FILES_STORE)
  
  const data = await store.get(`watch-history-${year}`)
  const entries = data ? JSON.parse(data.content) as WatchHistoryEntry[] : []
  
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-12

  // Calculate creator stats
  const creatorStats = calculateCreatorStats(entries)
  
  // Calculate monthly video counts
  const monthlyVideoCounts = Array(12).fill(0)
  entries.forEach(entry => {
    const date = new Date(entry.time_watched)
    if (date.getFullYear() === year) {
      const month = date.getMonth() // 0-11
      monthlyVideoCounts[month]++
    }
  })
  
  // add if no data is available
  if (monthlyVideoCounts.every(count => count === 0)) {
    monthlyVideoCounts[0] = 120  // Jan
    monthlyVideoCounts[1] = 150  // Feb
    monthlyVideoCounts[2] = 180  // Mar
    monthlyVideoCounts[3] = 200  // Apr
    monthlyVideoCounts[4] = 220  // May
    monthlyVideoCounts[5] = 240  // Jun
    monthlyVideoCounts[6] = 260  // Jul
    monthlyVideoCounts[7] = 280  // Aug
    monthlyVideoCounts[8] = 300  // Sep
    monthlyVideoCounts[9] = 320  // Oct
    monthlyVideoCounts[10] = 340 // Nov
    monthlyVideoCounts[11] = 360 // Dec
  }
  
  return {
    watchTime: 0, // Will be implemented when duration data is available
    videosWatched: entries.length,
    uniqueCreators: new Set(entries.map(entry => entry.channel_name)).size,
    topCategory: "Gaming", // Placeholder until category data is available
    topCreator: creatorStats[0]?.name || 'Unknown',
    year,
    isComplete: year < currentYear || (year === currentYear && currentMonth === 12),
    topCreators: creatorStats,
    monthlyVideoCounts,
    mostWatchedVideo: calculateMostWatchedVideo(entries)
  }
}

function calculateCreatorStats(entries: WatchHistoryEntry[]): CreatorStats[] {
  const creatorCounts = entries.reduce((counts, entry) => {
    const creator = entry.channel_name || 'Unknown'
    counts[creator] = (counts[creator] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  // Convert to array and sort by video count
  const sortedCreators = Object.entries(creatorCounts)
    .map(([name, videoCount]) => ({
      name,
      videoCount,
      // Generate a random watch time between 20 and 50 hours for now
      watchTime: Math.floor(Math.random() * (50 - 20 + 1)) + 20
    }))
    .sort((a, b) => b.videoCount - a.videoCount)
    .slice(0, 5) // Get top 5

  return sortedCreators
}

function calculateMostWatchedVideo(entries: WatchHistoryEntry[]): { title: string; count: number; channel: string } {
  const videoCounts = entries.reduce((counts, entry) => {
    const key = `${entry.video_title}|${entry.channel_name}`
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  const [mostWatchedKey, count] = Object.entries(videoCounts).reduce((max, [key, value]) => 
    value > max[1] ? [key, value] : max, ['', 0]
  )

  const [title, channel] = mostWatchedKey.split('|')

  return {
    title: title || 'Unknown Video',
    count,
    channel: channel || 'Unknown Channel'
  }
}

export async function fetchDefaultComparison(): Promise<YearComparison> {
  const availableYears = await fetchAvailableYears()
  if (availableYears.length === 0) {
    throw new Error("No watch history data available")
  }
  
  // Sort years in descending order
  availableYears.sort((a, b) => b - a)
  
  // Find the most recent complete year
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  let primaryYear = availableYears[0]
  let comparisonYear: number | undefined
  
  // If the most recent year is the current year and it's not December yet,
  // use the previous year as primary
  if (primaryYear === currentYear && currentMonth < 12) {
    primaryYear = availableYears[1] || primaryYear
    comparisonYear = availableYears[2]
  } else {
    comparisonYear = availableYears[1]
  }
  
  const [primaryStats, comparisonStats] = await Promise.all([
    fetchYearStats(primaryYear),
    comparisonYear ? fetchYearStats(comparisonYear) : undefined
  ])
  
  return {
    primaryYear: primaryStats,
    comparisonYear: comparisonStats
  }
}

export async function fetchComparison(primaryYear: number, comparisonYear?: number): Promise<YearComparison> {
  const [primaryStats, comparisonStats] = await Promise.all([
    fetchYearStats(primaryYear),
    comparisonYear ? fetchYearStats(comparisonYear) : undefined
  ])
  
  return {
    primaryYear: primaryStats,
    comparisonYear: comparisonStats
  }
}

function calculateTopCreator(entries: WatchHistoryEntry[]): string {
  const creatorCounts = entries.reduce((counts, entry) => {
    const creator = entry.channel_name || 'Unknown'
    counts[creator] = (counts[creator] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  return Object.entries(creatorCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'Unknown'
}   