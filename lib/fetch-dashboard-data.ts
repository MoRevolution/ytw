import { getCategoryName } from './youtube-categories'
import { logger } from './logger'
import { parseISODuration, getCurrentAnalysisYear } from './utils'
import { getYearData } from './indexeddb'

export interface WatchHistoryEntry {
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
  avgVideoDuration: number  // Average video duration in hours for this creator
  normalizedScore: number   // Watch time normalized by average video duration
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
  const currentYear = new Date().getFullYear()
  const years = []
  
  for (let year = currentYear; year >= 2020; year--) {
    const data = await getYearData(year)
    if (data) {
      years.push(year)
    }
  }
  
  return years
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
  if (entries.length === 0) {
    return {
      duration: 0,
      date: '',
      category: 'Unknown',
      videos: []
    }
  }

  // Sort entries by time watched
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.time_watched).getTime() - new Date(b.time_watched).getTime()
  )

  let currentSession: WatchHistoryEntry[] = [sortedEntries[0]]
  let longestSession: WatchHistoryEntry[] = []
  let previousEntryTime = new Date(sortedEntries[0].time_watched)
  
  // 30 minutes gap between consecutive videos = new session
  const SESSION_GAP = 30 * 60 * 1000

  for (let i = 1; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i]
    const entryTime = new Date(entry.time_watched)
    const timeSincePreviousEntry = entryTime.getTime() - previousEntryTime.getTime()

    if (timeSincePreviousEntry <= SESSION_GAP) {
      // Still in the same session - add to current session
      currentSession.push(entry)
    } else {
      // Gap too large - check if current session is longest, then start new one
      if (currentSession.length > longestSession.length) {
        longestSession = [...currentSession]
      }
      currentSession = [entry]
    }
    // Always update previous entry time for next comparison
    previousEntryTime = entryTime
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
  logger.log(`[fetchYearStats] Loading year ${year}`)
  const entries = await getYearData(year) as WatchHistoryEntry[] | null
  
  if (!entries) {
    logger.error(`[fetchYearStats] No data found for year ${year}`)
    throw new Error(`No data found for year ${year}`)
  }
  
  try {
    logger.log(`[fetchYearStats] Parsed ${entries.length} entries for ${year}`)
    
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const categoryStats = calculateCategoryStats(entries)
    const creatorStats = calculateCreatorStats(entries)
    
    // Calculate monthly watch time and video counts
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
    
    const totalWatchTime = monthlyWatchTime.reduce((sum, hours) => sum + hours, 0)
    const tags = extractTagsFromEntries(entries)
    
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
    
    logger.log(`[fetchYearStats] Completed for ${year}: ${Math.round(totalWatchTime)}h, ${entries.length} videos`)
    return stats
  } catch (error) {
    logger.error('[fetchYearStats] Failed:', error)
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
        channelId: entry.channel_url ? entry.channel_url.split('/').pop() || '' : '',
        avgVideoDuration: 0,
        normalizedScore: 0
      }
    }
    
    stats[creator].watchTime += durationHours
    stats[creator].videoCount++
    
    return stats
  }, {} as Record<string, CreatorStats>)

  // Calculate global average video duration across all entries
  const validDurations = entries.filter(e => e.duration && parseISODuration(e.duration) > 0)
  const totalDuration = validDurations.reduce((sum, e) => sum + parseISODuration(e.duration), 0)
  const globalAvgDuration = validDurations.length > 0 ? totalDuration / validDurations.length : 0.1 // Default to 6 min if no valid durations

  // Calculate avg video duration and normalized score for each creator
  Object.values(creatorStats).forEach(creator => {
    creator.avgVideoDuration = creator.videoCount > 0 ? creator.watchTime / creator.videoCount : 0
    // Normalized score = videoCount * globalAvgDuration
    // This gives a score based on number of videos, normalized by average video length
    // So creators with many short videos get fair comparison to creators with fewer long videos
    creator.normalizedScore = creator.videoCount * globalAvgDuration
  })

  // Convert to array and sort by watch time, keep top 20 so normalized view can pick different top 5
  const sortedCreators = Object.values(creatorStats)
    .sort((a, b) => b.watchTime - a.watchTime)
    .slice(0, 20) // Keep top 20 for both raw and normalized sorting

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

  // Sort by count and get top 20
  const topVideos = Object.entries(videoCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
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
  const availableYears = await fetchAvailableYears()
  
  if (availableYears.length === 0) {
    throw new Error("No watch history data available")
  }
  
  availableYears.sort((a, b) => b - a)
  
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  let primaryYear = availableYears[0]
  let comparisonYear: number | undefined
  
  if (primaryYear === currentYear && currentMonth < 12) {
    primaryYear = availableYears[1] || primaryYear
    comparisonYear = availableYears[2]
  } else {
    comparisonYear = availableYears[1]
  }
  
  logger.log(`[fetchDefaultComparison] Primary: ${primaryYear}, Comparison: ${comparisonYear ?? 'none'}`)
  
  try {
    const primaryStats = await fetchYearStats(primaryYear)
    
    let comparisonStats = undefined
    if (comparisonYear) {
      comparisonStats = await fetchYearStats(comparisonYear)
    }
    
    return {
      primaryYear: primaryStats,
      comparisonYear: comparisonStats
    }
  } catch (error) {
    logger.error('[fetchDefaultComparison] Failed:', error)
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