import { WatchHistoryEntry } from './fetch-dashboard-data'
import { getChannelThumbnailCached } from './youtube-api'
import { parseISODuration } from './utils'
import { getYearData } from './indexeddb'

export interface CreatorStats {
  name: string
  watchTime: number
  videoCount: number
  channelId: string
  category?: string
}

export interface CreatorCategory {
  name: string
  percentage: number
  creators: string[]
}

export async function fetchCreatorStats(year: number): Promise<{
  topCreators: CreatorStats[]
  categories: CreatorCategory[]
}> {
  const entries = await getYearData(year) as WatchHistoryEntry[] | null
  
  if (!entries) {
    throw new Error(`No data found for year ${year}`)
  }
  
  // Calculate creator stats
  const creatorStats = calculateCreatorStats(entries)
  
  // Calculate category stats
  const categories = calculateCreatorCategories(creatorStats)
  
  return {
    topCreators: creatorStats,
    categories
  }
}

function calculateCreatorStats(entries: WatchHistoryEntry[]): CreatorStats[] {
  const creatorStats = entries.reduce<Record<string, CreatorStats>>((stats, entry) => {
    const creator = entry.channel_name || 'Unknown'
    const durationHours = parseISODuration(entry.duration)
    
    if (!stats[creator]) {
      stats[creator] = {
        name: creator,
        watchTime: 0,
        videoCount: 0,
        channelId: entry.channel_url ? entry.channel_url.split('/').pop() || '' : '',
        category: entry.category_id?.toString()
      }
    }
    
    stats[creator].watchTime += durationHours
    stats[creator].videoCount++
    
    return stats
  }, {})

  // Convert to array and sort by watch time
  return Object.values(creatorStats)
    .sort((a, b) => b.watchTime - a.watchTime)
    .slice(0, 5) // Get top 5
}

function calculateCreatorCategories(creators: CreatorStats[]): CreatorCategory[] {
  const categoryStats = creators.reduce((stats, creator) => {
    const category = creator.category || 'Unknown'
    
    if (!stats[category]) {
      stats[category] = {
        name: category,
        percentage: 0,
        creators: []
      }
    }
    
    stats[category].creators.push(creator.name)
    return stats
  }, {} as Record<string, CreatorCategory>)

  // Calculate percentages
  const totalWatchTime = creators.reduce((sum, creator) => sum + creator.watchTime, 0)
  Object.values(categoryStats).forEach(stat => {
    const categoryWatchTime = creators
      .filter(c => c.category === stat.name)
      .reduce((sum, c) => sum + c.watchTime, 0)
    stat.percentage = (categoryWatchTime / totalWatchTime) * 100
  })

  // Convert to array and sort by percentage
  return Object.values(categoryStats)
    .sort((a, b) => b.percentage - a.percentage)
}

