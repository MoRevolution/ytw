import { openDB } from "idb"
import { DB_NAME, FILES_STORE } from './constants'
import { getCategoryName } from './youtube-categories'

interface WatchHistoryEntry {
  channel_name: string
  time_watched: string
  video_title: string
  duration: string // ISO 8601 duration format
  category_id?: number // Add category_id field
  tags: string // String representation of an array of tags
}

interface CreatorStats {
  name: string
  watchTime: number
  videoCount: number
}

export interface CategoryStats {
  name: string
  watchTime: number
  percentage: number
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
  monthlyWatchTime: number[]
  categoryStats: CategoryStats[]
  mostWatchedVideo: {
    title: string
    count: number
    channel: string
  }
  tags: string[] // Add tags field
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

function parseISODuration(duration: string): number {
  if (!duration) return 0; // Handle undefined or empty duration
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours + (minutes / 60) + (seconds / 3600);
}

function calculateCategoryStats(entries: WatchHistoryEntry[]): CategoryStats[] {
  const categoryStats = entries.reduce((stats, entry) => {
    const categoryId = entry.category_id?.toString() || 'unknown'
    const categoryName = getCategoryName(categoryId)
    const durationHours = parseISODuration(entry.duration)
    
    if (!stats[categoryName]) {
      stats[categoryName] = {
        name: categoryName,
        watchTime: 0
      }
    }
    
    stats[categoryName].watchTime += durationHours
    return stats
  }, {} as Record<string, { name: string; watchTime: number }>)

  // Calculate total watch time
  const totalWatchTime = Object.values(categoryStats).reduce(
    (sum, stat) => sum + stat.watchTime,
    0
  )

  // Convert to array, calculate percentages, and sort by watch time
  const sortedCategories = Object.values(categoryStats)
    .map(stat => ({
      name: stat.name,
      watchTime: stat.watchTime,
      percentage: (stat.watchTime / totalWatchTime) * 100
    }))
    .sort((a, b) => b.watchTime - a.watchTime)

  return sortedCategories
}

function extractTagsFromEntries(entries: WatchHistoryEntry[]): string[] {
  const tagCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    try {
      // Parse the tags string into an array
      const tags = JSON.parse(entry.tags) as string[];
      
      // Count each tag
      tags.forEach(tag => {
        if (tag && tag.length > 0) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    } catch (error) {
      console.warn('Failed to parse tags for entry:', entry.video_title);
    }
  });
  
  // Convert to array and sort by frequency
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50) // Get top 50 tags
    .map(([tag]) => tag);
}

export async function fetchYearStats(year: number): Promise<DashboardStats> {
  console.log(`🔄 Fetching stats for year ${year}...`)
  const db = await openDB(DB_NAME, 1)
  const tx = db.transaction(FILES_STORE, "readonly")
  const store = tx.objectStore(FILES_STORE)
  
  const data = await store.get(`watch-history-${year}`)
  console.log(`📦 Retrieved data for year ${year}:`, data ? 'exists' : 'not found')
  
  if (!data) {
    console.error(`❌ No data found for year ${year}`)
    throw new Error(`No data found for year ${year}`)
  }
  
  try {
    console.log('🔄 Parsing watch history data...')
    const entries = JSON.parse(data.content) as WatchHistoryEntry[]
    console.log(`✅ Successfully parsed ${entries.length} entries`)
    
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    // Calculate category stats
    console.log('🔄 Calculating category stats...')
    const categoryStats = calculateCategoryStats(entries)
    console.log('✅ Category stats calculated:', categoryStats)
    
    // Calculate creator stats
    console.log('🔄 Calculating creator stats...')
    const creatorStats = calculateCreatorStats(entries)
    console.log('✅ Creator stats calculated:', creatorStats)
    
    // Calculate monthly watch time and video counts
    console.log('🔄 Calculating monthly stats...')
    const monthlyWatchTime = Array(12).fill(0)
    const monthlyVideoCounts = Array(12).fill(0)
    
    entries.forEach(entry => {
      const date = new Date(entry.time_watched)
      if (date.getFullYear() === year) {
        const month = date.getMonth() // 0-11
        const durationHours = parseISODuration(entry.duration)
        monthlyWatchTime[month] += durationHours
        monthlyVideoCounts[month]++
      }
    })
    
    console.log('✅ Monthly watch time calculated:', monthlyWatchTime)
    console.log('✅ Monthly video counts calculated:', monthlyVideoCounts)
    
    // Calculate total watch time
    const totalWatchTime = monthlyWatchTime.reduce((sum, hours) => sum + hours, 0)
    console.log('✅ Total watch time calculated:', totalWatchTime)
    
    // Extract tags from entries
    console.log('🔄 Extracting tags from entries...')
    const tags = extractTagsFromEntries(entries)
    console.log('✅ Tags extracted:', tags)
    
    const stats = {
      watchTime: totalWatchTime,
      videosWatched: entries.length,
      uniqueCreators: new Set(entries.map(entry => entry.channel_name)).size,
      topCategory: categoryStats[0]?.name || "Unknown",
      topCreator: creatorStats[0]?.name || 'Unknown',
      year,
      isComplete: year < currentYear || (year === currentYear && currentMonth === 12),
      topCreators: creatorStats,
      monthlyVideoCounts,
      monthlyWatchTime,
      categoryStats,
      mostWatchedVideo: calculateMostWatchedVideo(entries),
      tags
    }
    
    console.log('✅ Final stats calculated:', stats)
    return stats
  } catch (error) {
    console.error('❌ Error in fetchYearStats:', error)
    console.error('Problematic data:', data)
    throw error
  }
}

function calculateCreatorStats(entries: WatchHistoryEntry[]): CreatorStats[] {
  const creatorStats = entries.reduce((stats, entry) => {
    const creator = entry.channel_name || 'Unknown'
    const durationHours = parseISODuration(entry.duration)
    
    if (!stats[creator]) {
      stats[creator] = {
        name: creator,
        watchTime: 0,
        videoCount: 0
      }
    }
    
    stats[creator].watchTime += durationHours
    stats[creator].videoCount++
    
    return stats
  }, {} as Record<string, CreatorStats>)

  // Convert to array and sort by watch time
  const sortedCreators = Object.values(creatorStats)
    .sort((a, b) => b.watchTime - a.watchTime)
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
  console.log('🔄 Starting fetchDefaultComparison...')
  const availableYears = await fetchAvailableYears()
  console.log('📅 Available years:', availableYears)
  
  if (availableYears.length === 0) {
    console.error('❌ No watch history data available')
    throw new Error("No watch history data available")
  }
  
  // Sort years in descending order
  availableYears.sort((a, b) => b - a)
  console.log('📅 Sorted years:', availableYears)
  
  // Find the most recent complete year
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  console.log('📅 Current year/month:', currentYear, currentMonth)
  
  let primaryYear = availableYears[0]
  let comparisonYear: number | undefined
  
  // If the most recent year is the current year and it's not December yet,
  // use the previous year as primary
  if (primaryYear === currentYear && currentMonth < 12) {
    console.log('📅 Using previous year as primary since current year is incomplete')
    primaryYear = availableYears[1] || primaryYear
    comparisonYear = availableYears[2]
  } else {
    comparisonYear = availableYears[1]
  }
  
  console.log('📅 Selected years - Primary:', primaryYear, 'Comparison:', comparisonYear)
  
  try {
    console.log('🔄 Fetching primary year stats...')
    const primaryStats = await fetchYearStats(primaryYear)
    console.log('✅ Primary stats fetched successfully:', primaryStats)
    
    let comparisonStats = undefined
    if (comparisonYear) {
      console.log('🔄 Fetching comparison year stats...')
      comparisonStats = await fetchYearStats(comparisonYear)
      console.log('✅ Comparison stats fetched successfully:', comparisonStats)
    }
    
    const result = {
      primaryYear: primaryStats,
      comparisonYear: comparisonStats
    }
    
    console.log('✅ Final comparison result:', result)
    return result
  } catch (error) {
    console.error('❌ Error in fetchDefaultComparison:', error)
    throw error
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