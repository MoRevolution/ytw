import { openDB } from "idb"
import { DB_NAME, FILES_STORE } from './constants'
import { getCategoryName } from './youtube-categories'

interface WatchHistoryEntry {
  title: string
  video_id: string
  channel_name: string
  channel_url: string
  time_watched: string
  channel: string
  category_id?: number
  published_at: string
  tags: string[]
  view_count: number
  like_count: number
  comment_count: number
  made_for_kids: boolean
  duration: string // ISO 8601 duration format
}

interface CreatorStats {
  name: string
  watchTime: number
  videoCount: number
  channelId: string
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
  mostWatchedVideos: {
    title: string
    count: number
    channel: string
    videoId: string
  }[]
  longestSession: {
    duration: number
    date: string
    category: string
    videos: {
      title: string
      channel: string
      videoId: string
      likeCount: number
      duration: string
    }[]
  }
  tags: string[]
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

  let failedCount = 0;

  entries.forEach(entry => {
    try {
      // Tags are now an array, no need to parse
      const tags = entry.tags;
      
      // Count each tag
      tags.forEach(tag => {
        if (tag && tag.length > 0) {
          // Clean up the tag
          const cleanTag = tag
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' '); // Normalize whitespace
          
          if (cleanTag) {
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        }
      });
    } catch (error) {
      failedCount++;
    }
  });

  if (failedCount > 0) {
    console.warn(`Failed to process tags for ${failedCount} entries.`);
  }
  
  // Convert to array and sort by frequency
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 250) // Get top 250 tags
    .map(([tag]) => tag);

  console.log('Final tag counts:', tagCounts);
  console.log('Sorted tags:', sortedTags);
  
  return sortedTags;
}

function calculateLongestSession(entries: WatchHistoryEntry[]): DashboardStats['longestSession'] {
  // Sort entries by time watched
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.time_watched).getTime() - new Date(b.time_watched).getTime()
  )

  let currentSession: WatchHistoryEntry[] = []
  let longestSession: WatchHistoryEntry[] = []
  let currentStartTime = new Date(sortedEntries[0].time_watched)
  
  // 30 minutes in milliseconds
  const SESSION_GAP = 30 * 60 * 1000

  for (const entry of sortedEntries) {
    const entryTime = new Date(entry.time_watched)
    const timeDiff = entryTime.getTime() - currentStartTime.getTime()

    if (timeDiff <= SESSION_GAP) {
      currentSession.push(entry)
    } else {
      if (currentSession.length > longestSession.length) {
        longestSession = [...currentSession]
      }
      currentSession = [entry]
      currentStartTime = entryTime
    }
  }

  // Check the last session
  if (currentSession.length > longestSession.length) {
    longestSession = currentSession
  }

  if (longestSession.length === 0) {
    return {
      duration: 0,
      date: '',
      category: 'Unknown',
      videos: []
    }
  }

  // Calculate total duration
  const startTime = new Date(longestSession[0].time_watched)
  const endTime = new Date(longestSession[longestSession.length - 1].time_watched)
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) // Convert to hours

  // Find the most common category in the session
  const categoryCounts = longestSession.reduce((counts, entry) => {
    const category = getCategoryName(entry.category_id?.toString() || 'unknown')
    counts[category] = (counts[category] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  const mostCommonCategory = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)[0][0]

  // Get all videos from the session, sorted by like count
  const sessionVideos = longestSession.map(entry => ({
    title: entry.title,
    channel: entry.channel_name,
    videoId: entry.video_id,
    likeCount: entry.like_count,
    duration: entry.duration
  })).sort((a, b) => b.likeCount - a.likeCount)

  return {
    duration,
    date: startTime.toISOString(),
    category: mostCommonCategory,
    videos: sessionVideos
  }
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
      mostWatchedVideos: calculateMostWatchedVideo(entries),
      longestSession: calculateLongestSession(entries),
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
        videoCount: 0,
        channelId: entry.channel_url ? entry.channel_url.split('/').pop() || '' : ''
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

function calculateMostWatchedVideo(entries: WatchHistoryEntry[]): { title: string; count: number; channel: string; videoId: string }[] {
  // Filter out entries with undefined titles
  const validEntries = entries.filter(entry => entry.title && entry.title !== 'undefined')
  
  if (validEntries.length === 0) {
    return [{
      title: 'No valid videos found',
      count: 0,
      channel: 'Unknown Channel',
      videoId: ''
    }]
  }

  const videoCounts = validEntries.reduce((counts, entry) => {
    const key = `${entry.title}|${entry.channel_name}|${entry.video_id}`
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  // Sort by count and get top 5
  const topVideos = Object.entries(videoCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key, count]) => {
      const [title, channel, videoId] = key.split('|')
      return {
        title: title || 'Unknown Video',
        count,
        channel: channel || 'Unknown Channel',
        videoId: videoId || ''
      }
    })

  return topVideos
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