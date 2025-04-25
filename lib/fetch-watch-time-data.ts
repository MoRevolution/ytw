import { openDB } from "idb"
import { DB_NAME, FILES_STORE } from './constants'

interface WatchHistoryEntry {
  channel_name: string
  time_watched: string
  video_title: string
  duration: string // ISO 8601 duration format
  category_id?: number
  tags: string
}

interface WatchTimeStats {
  totalWatchTime: number
  averageDailyWatchTime: number
  averageVideoLength: number
  dailyWatchTime: {
    date: string
    watchTime: number
  }[]
  videoLengthDistribution: {
    length: string
    count: number
  }[]
  year: number
  previousYearStats?: {
    averageDailyWatchTime: number
    averageVideoLength: number
    year: number
  }
  weeklyPatterns: {
    dayOfWeek: string
    averageWatchTime: number
  }[]
  dailyPatterns: {
    hour: number
    averageWatchTime: number
  }[]
  milestones: {
    longestSingleDay: {
      date: string
      watchTime: number
      videoCount: number
      category?: string
    }
    mostActiveMonth: {
      month: string
      watchTime: number
      videoCount: number
      increaseFromAverage: number
    }
    longestSession: {
      date: string
      duration: number
      category?: string
    }
    totalHoursMilestone: {
      hours: number
      date: string
    }
  }
}

function parseISODuration(duration: string): number {
  if (!duration) {
    console.warn('⚠️ Empty duration string received')
    return 0
  }
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) {
    console.warn('⚠️ Invalid duration format:', duration)
    return 0
  }

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours + (minutes / 60) + (seconds / 3600)
}

// Function to convert UTC to Central Time (UTC-6)
function convertToCentralTime(date: Date): Date {
  const centralDate = new Date(date)
  centralDate.setHours(centralDate.getHours() - 6)
  return centralDate
}

function calculateMilestones(entries: WatchHistoryEntry[]): WatchTimeStats['milestones'] {
  // Group entries by date
  const dailyStats = new Map<string, { watchTime: number; videos: number; categories: Map<string, number> }>()
  
  entries.forEach(entry => {
    const date = new Date(entry.time_watched).toISOString().split('T')[0]
    const duration = parseISODuration(entry.duration)
    
    if (!dailyStats.has(date)) {
      dailyStats.set(date, { watchTime: 0, videos: 0, categories: new Map() })
    }
    
    const day = dailyStats.get(date)!
    day.watchTime += duration
    day.videos += 1
    
    // Track category frequency
    if (entry.category_id) {
      const categoryCount = day.categories.get(entry.category_id.toString()) || 0
      day.categories.set(entry.category_id.toString(), categoryCount + 1)
    }
  })

  // Find longest single day
  let longestDay = { date: '', watchTime: 0, videoCount: 0, category: '' }
  dailyStats.forEach((stats, date) => {
    if (stats.watchTime > longestDay.watchTime) {
      // Find most watched category
      let maxCategory = ''
      let maxCount = 0
      stats.categories.forEach((count, category) => {
        if (count > maxCount) {
          maxCount = count
          maxCategory = category
        }
      })
      
      longestDay = {
        date,
        watchTime: stats.watchTime,
        videoCount: stats.videos,
        category: maxCategory
      }
    }
  })

  // Group by month
  const monthlyStats = new Map<string, { watchTime: number; videos: number }>()
  dailyStats.forEach((stats, date) => {
    const month = date.substring(0, 7) // YYYY-MM
    if (!monthlyStats.has(month)) {
      monthlyStats.set(month, { watchTime: 0, videos: 0 })
    }
    const monthStats = monthlyStats.get(month)!
    monthStats.watchTime += stats.watchTime
    monthStats.videos += stats.videos
  })

  // Find most active month
  let mostActiveMonth = { month: '', watchTime: 0, videoCount: 0, increaseFromAverage: 0 }
  const averageMonthlyWatchTime = Array.from(monthlyStats.values())
    .reduce((sum, stats) => sum + stats.watchTime, 0) / monthlyStats.size
  
  monthlyStats.forEach((stats, month) => {
    if (stats.watchTime > mostActiveMonth.watchTime) {
      mostActiveMonth = {
        month,
        watchTime: stats.watchTime,
        videoCount: stats.videos,
        increaseFromAverage: ((stats.watchTime - averageMonthlyWatchTime) / averageMonthlyWatchTime) * 100
      }
    }
  })

  // Find longest session (consecutive videos within 30 minutes)
  let longestSession = { date: '', duration: 0, category: '' }
  let currentSession = { start: '', duration: 0, category: '' }
  
  entries.sort((a, b) => new Date(a.time_watched).getTime() - new Date(b.time_watched).getTime())
    .forEach(entry => {
      const date = new Date(entry.time_watched)
      const duration = parseISODuration(entry.duration)
      
      if (!currentSession.start) {
        currentSession = {
          start: date.toISOString(),
          duration,
          category: entry.category_id?.toString() || ''
        }
      } else {
        const timeDiff = (date.getTime() - new Date(currentSession.start).getTime()) / (1000 * 60) // minutes
        if (timeDiff <= 30) {
          currentSession.duration += duration
        } else {
          if (currentSession.duration > longestSession.duration) {
            longestSession = {
              date: currentSession.start,
              duration: currentSession.duration,
              category: currentSession.category
            }
          }
          currentSession = {
            start: date.toISOString(),
            duration,
            category: entry.category_id?.toString() || ''
          }
        }
      }
    })

  // Check last session
  if (currentSession.duration > longestSession.duration) {
    longestSession = {
      date: currentSession.start,
      duration: currentSession.duration,
      category: currentSession.category
    }
  }

  // Find total hours milestone
  let totalHours = 0
  let milestoneDate = ''
  const milestoneHours = 250 // You can adjust this milestone
  
  entries.sort((a, b) => new Date(a.time_watched).getTime() - new Date(b.time_watched).getTime())
    .forEach(entry => {
      totalHours += parseISODuration(entry.duration)
      if (totalHours >= milestoneHours && !milestoneDate) {
        milestoneDate = new Date(entry.time_watched).toISOString()
      }
    })

  return {
    longestSingleDay: {
      date: longestDay.date,
      watchTime: longestDay.watchTime,
      videoCount: longestDay.videoCount,
      category: longestDay.category
    },
    mostActiveMonth: {
      month: mostActiveMonth.month,
      watchTime: mostActiveMonth.watchTime,
      videoCount: mostActiveMonth.videoCount,
      increaseFromAverage: mostActiveMonth.increaseFromAverage
    },
    longestSession: {
      date: longestSession.date,
      duration: longestSession.duration,
      category: longestSession.category
    },
    totalHoursMilestone: {
      hours: milestoneHours,
      date: milestoneDate
    }
  }
}

function calculateWatchTimeStats(entries: WatchHistoryEntry[], year: number): WatchTimeStats {
  // Calculate total watch time and video count
  let totalWatchTime = 0
  let totalVideos = 0
  const dailyWatchTime: Record<string, number> = {}
  const videoLengthDistribution: Record<string, number> = {}

  // Track actual days with watch time
  const daysWithWatchTime = new Set<string>()

  // Calculate weekly patterns
  const weeklyPatterns = new Map<string, { total: number; count: number }>()
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Calculate daily patterns (24 hours)
  const dailyPatterns = new Map<number, { total: number; count: number }>()

  entries.forEach(entry => {
    const date = new Date(entry.time_watched)
    const durationHours = parseISODuration(entry.duration)
    totalWatchTime += durationHours
    totalVideos++

    // Track daily watch time
    const dateStr = date.toISOString().split('T')[0]
    dailyWatchTime[dateStr] = (dailyWatchTime[dateStr] || 0) + durationHours
    daysWithWatchTime.add(dateStr)

    // Track video length distribution
    const durationMinutes = Math.round(durationHours * 60)
    const lengthBucket = Math.floor(durationMinutes / 5) * 5 // Group into 5-minute buckets
    const lengthStr = `${lengthBucket}-${lengthBucket + 4} min`
    videoLengthDistribution[lengthStr] = (videoLengthDistribution[lengthStr] || 0) + 1

    if (date.getFullYear() === year) {
      // Weekly pattern
      const dayOfWeek = daysOfWeek[date.getDay()]
      const weekPattern = weeklyPatterns.get(dayOfWeek) || { total: 0, count: 0 }
      weeklyPatterns.set(dayOfWeek, {
        total: weekPattern.total + durationHours,
        count: weekPattern.count + 1
      })

      // Daily pattern - convert to Central Time
      const centralDate = convertToCentralTime(date)
      const hour = centralDate.getHours()
      const dayPattern = dailyPatterns.get(hour) || { total: 0, count: 0 }
      dailyPatterns.set(hour, {
        total: dayPattern.total + durationHours,
        count: dayPattern.count + 1
      })
    }
  })

  // Calculate average daily watch time based on actual days watched
  const averageDailyWatchTime = totalWatchTime / daysWithWatchTime.size

  // Calculate average video length
  const averageVideoLength = totalWatchTime / totalVideos

  // Convert daily watch time to array and sort by date
  const dailyWatchTimeArray = Object.entries(dailyWatchTime)
    .map(([date, watchTime]) => ({ date, watchTime }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Convert video length distribution to array and sort by length
  const videoLengthDistributionArray = Object.entries(videoLengthDistribution)
    .map(([length, count]) => ({ length, count }))
    .sort((a, b) => {
      const aMin = parseInt(a.length)
      const bMin = parseInt(b.length)
      return aMin - bMin
    })

  // Convert weekly patterns to array
  const weeklyPatternsArray = daysOfWeek.map(day => ({
    dayOfWeek: day,
    averageWatchTime: weeklyPatterns.get(day) 
      ? (weeklyPatterns.get(day)!.total / weeklyPatterns.get(day)!.count) * 60 // Convert to minutes
      : 0
  }))

  // Convert daily patterns to array and sort by hour
  const dailyPatternsArray = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    averageWatchTime: dailyPatterns.get(hour)
      ? (dailyPatterns.get(hour)!.total / dailyPatterns.get(hour)!.count) * 60 // Convert to minutes
      : 0
  }))

  const stats = {
    totalWatchTime,
    averageDailyWatchTime,
    averageVideoLength,
    dailyWatchTime: dailyWatchTimeArray,
    videoLengthDistribution: videoLengthDistributionArray,
    year,
    weeklyPatterns: weeklyPatternsArray,
    dailyPatterns: dailyPatternsArray,
    milestones: calculateMilestones(entries)
  }

  return stats
}

export async function fetchWatchTimeStats(year: number): Promise<WatchTimeStats> {
  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // 1-12

    // If requesting current year and it's not December yet, use previous year
    if (year === currentYear && currentMonth < 12) {
      console.log('📅 Using previous year since current year is incomplete')
      year = currentYear - 1
    }

    const db = await openDB(DB_NAME, 1)
    const tx = db.transaction(FILES_STORE, "readonly")
    const store = tx.objectStore(FILES_STORE)
    
    // Get current year's data
    const data = await store.get(`watch-history-${year}`)
    
    if (!data) {
      console.error('❌ No watch history data found for year:', year)
      throw new Error(`No watch history data found for year ${year}`)
    }
    
    const entries = JSON.parse(data.content) as WatchHistoryEntry[]
    const stats = calculateWatchTimeStats(entries, year)

    // Get previous year's data for comparison
    const previousYear = year - 1
    console.log('🔄 Fetching previous year data:', previousYear)
    const previousYearData = await store.get(`watch-history-${previousYear}`)
    
    if (previousYearData) {
      const previousYearEntries = JSON.parse(previousYearData.content) as WatchHistoryEntry[]
      const previousYearStats = calculateWatchTimeStats(previousYearEntries, previousYear)
      
      stats.previousYearStats = {
        averageDailyWatchTime: previousYearStats.averageDailyWatchTime,
        averageVideoLength: previousYearStats.averageVideoLength,
        year: previousYear
      }
    }
    
    // Log final stats that will hydrate the UI
    console.log('📊 Watch Time Stats:', {
      year,
      totalWatchTime: `${Math.round(stats.totalWatchTime)} hours`,
      averageDailyWatchTime: `${Math.round(stats.averageDailyWatchTime * 60)} minutes`,
      averageVideoLength: `${Math.round(stats.averageVideoLength * 60)} minutes`,
      dailyWatchTimeEntries: stats.dailyWatchTime.length,
      videoLengthDistribution: stats.videoLengthDistribution,
      previousYearComparison: stats.previousYearStats ? {
        averageDailyWatchTime: `${Math.round(stats.previousYearStats.averageDailyWatchTime * 60)} minutes`,
        averageVideoLength: `${Math.round(stats.previousYearStats.averageVideoLength * 60)} minutes`
      } : 'No previous year data available'
    })
    
    return stats
  } catch (error) {
    console.error('❌ Error in fetchWatchTimeStats:', error)
    throw error
  }
} 