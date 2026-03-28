import { youtubeCategories } from './youtube-categories'
import { logger } from "./logger"
import { parseISODuration, getCurrentAnalysisYear } from './utils'
import { getYearData } from './indexeddb'

interface VideoStats {
  videoId: string
  title: string
  channelTitle: string
  watchCount: number
  duration: number
}

interface CategoryStats {
  categoryId: string
  watchTime: number
  videoCount: number
  percentage: number
  topVideos: VideoStats[]
}

interface CategoryComparison {
  categoryId: string
  currentYear: {
    watchTime: number
    percentage: number
  }
  previousYear: {
    watchTime: number
    percentage: number
  }
  change: number
}

interface MonthlyCategoryEntry {
  month: string  // "Jan", "Feb", etc.
  [categoryId: string]: number | string  // watchTime per category + "month" key
}

export interface CategoryData {
  year: number
  totalWatchTime: number
  categoryDistribution: CategoryStats[]
  categoryComparison: CategoryComparison[]
  monthlyBreakdown: MonthlyCategoryEntry[]
}

function calculateCategoryStats(entries: any[], year: number): CategoryData {
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Group entries by category and video
  const categoryStats = new Map<string, { 
    watchTime: number
    videoCount: number
    videos: Map<string, {
      title: string
      channelTitle: string
      watchCount: number
      duration: number
    }>
  }>()
  let totalWatchTime = 0

  // Monthly tracking: month index → categoryId → hours
  const monthlyMap = new Map<number, Map<string, number>>()

  entries.forEach(entry => {
    const categoryId = entry.category_id?.toString() || 'unknown'
    const videoId = entry.video_id
    const duration = parseISODuration(entry.duration)
    
    if (!categoryStats.has(categoryId)) {
      categoryStats.set(categoryId, { 
        watchTime: 0, 
        videoCount: 0,
        videos: new Map()
      })
    }
    
    const stats = categoryStats.get(categoryId)!
    stats.watchTime += duration
    stats.videoCount += 1
    totalWatchTime += duration

    // Track monthly breakdown
    const watchDate = new Date(entry.time_watched || entry.time)
    const monthIdx = watchDate.getMonth()
    if (!monthlyMap.has(monthIdx)) monthlyMap.set(monthIdx, new Map())
    const monthCats = monthlyMap.get(monthIdx)!
    monthCats.set(categoryId, (monthCats.get(categoryId) || 0) + duration)

    // Track video stats
    if (!stats.videos.has(videoId)) {
      stats.videos.set(videoId, {
        title: entry.title,
        channelTitle: entry.channel_title,
        watchCount: 0,
        duration: duration
      })
    }
    const videoStats = stats.videos.get(videoId)!
    videoStats.watchCount += 1
  })

  // Convert to array, calculate percentages, and sort by watch time
  const categoryDistribution = Array.from(categoryStats.entries())
    .map(([categoryId, stats]) => {
      // Get top 3 videos for this category
      const topVideos = Array.from(stats.videos.entries())
        .map(([videoId, videoStats]) => ({
          videoId,
          title: videoStats.title,
          channelTitle: videoStats.channelTitle,
          watchCount: videoStats.watchCount,
          duration: videoStats.duration
        }))
        .sort((a, b) => b.watchCount - a.watchCount)
        .slice(0, 3)

      return {
        categoryId,
        watchTime: stats.watchTime,
        videoCount: stats.videoCount,
        percentage: (stats.watchTime / totalWatchTime) * 100,
        topVideos
      }
    })
    .sort((a, b) => b.watchTime - a.watchTime)
    .slice(0, 5) // Only keep top 5 categories

  // Build monthly breakdown for the top 5 categories
  const top5Ids = new Set(categoryDistribution.map(c => c.categoryId))
  const monthlyBreakdown: MonthlyCategoryEntry[] = MONTH_NAMES.map((name, idx) => {
    const row: MonthlyCategoryEntry = { month: name }
    const monthCats = monthlyMap.get(idx)
    if (monthCats) {
      for (const catId of top5Ids) {
        row[catId] = Math.round((monthCats.get(catId) || 0) * 10) / 10
      }
    } else {
      for (const catId of top5Ids) {
        row[catId] = 0
      }
    }
    return row
  })

  return {
    year,
    totalWatchTime,
    categoryDistribution,
    categoryComparison: [], // Initialize empty array
    monthlyBreakdown
  }
}

function calculateCategoryComparison(
  currentYearData: CategoryData,
  previousYearData: CategoryData
): CategoryComparison[] {
  const comparisons: CategoryComparison[] = []

  // Get all unique categories from both years
  const allCategories = new Set([
    ...currentYearData.categoryDistribution.map(c => c.categoryId),
    ...previousYearData.categoryDistribution.map(c => c.categoryId)
  ])

  allCategories.forEach(categoryId => {
    const currentYear = currentYearData.categoryDistribution.find(c => c.categoryId === categoryId)
    const previousYear = previousYearData.categoryDistribution.find(c => c.categoryId === categoryId)

    comparisons.push({
      categoryId,
      currentYear: {
        watchTime: currentYear?.watchTime || 0,
        percentage: currentYear?.percentage || 0
      },
      previousYear: {
        watchTime: previousYear?.watchTime || 0,
        percentage: previousYear?.percentage || 0
      },
      change: (currentYear?.percentage || 0) - (previousYear?.percentage || 0)
    })
  })

  return comparisons
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5) // Only keep top 5 comparisons
}

// Add localStorage cache helpers
const CACHE_KEY_PREFIX = 'ytw-categories-'

function getCachedData(year: number): CategoryData | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${year}`)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    logger.error('Error reading from cache:', error)
    return null
  }
}

function setCachedData(year: number, data: CategoryData): void {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${year}`, JSON.stringify(data))
  } catch (error) {
    logger.error('Error writing to cache:', error)
  }
}

export async function fetchCategoryData(year: number): Promise<CategoryData> {
  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    if (year === currentYear && currentMonth < 12) {
      logger.log('[fetchCategoryData] Current year incomplete, falling back to previous year')
      year = currentYear - 1
    }

    const cachedData = getCachedData(year)
    if (cachedData) {
      logger.log('[fetchCategoryData] Using cached data')
      return cachedData
    }

    const entries = await getYearData(year)
    
    if (!entries) {
      logger.error(`[fetchCategoryData] No data found for year ${year}`)
      throw new Error(`No watch history data found for year ${year}`)
    }
    
    const currentYearData = calculateCategoryStats(entries, year)

    const previousYear = year - 1
    const previousYearEntries = await getYearData(previousYear)
    
    if (previousYearEntries) {
      const previousYearStats = calculateCategoryStats(previousYearEntries, previousYear)
      
      currentYearData.categoryComparison = calculateCategoryComparison(
        currentYearData,
        previousYearStats
      )
    } else {
      // If no previous year data, create empty comparisons
      currentYearData.categoryComparison = currentYearData.categoryDistribution.map(category => ({
        categoryId: category.categoryId,
        currentYear: {
          watchTime: category.watchTime,
          percentage: category.percentage
        },
        previousYear: {
          watchTime: 0,
          percentage: 0
        },
        change: category.percentage
      }))
    }
    
    // Cache the results
    setCachedData(year, currentYearData)
    
    return currentYearData
  } catch (error) {
    logger.error('[fetchCategoryData] Failed:', error)
    throw error
  }
} 