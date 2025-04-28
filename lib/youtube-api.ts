const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

export async function getChannelThumbnail(channelId: string): Promise<string | null> {
  if (!channelId) return null
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&fields=items(snippet(thumbnails))&key=${YOUTUBE_API_KEY}`
    )
    
    if (!response.ok) {
      console.error('Failed to fetch channel data:', await response.text())
      return null
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      console.warn(`No channel found for ID: ${channelId}`)
      return null
    }

    return data.items[0].snippet.thumbnails.default.url
  } catch (error) {
    console.error('Error fetching channel thumbnail:', error)
    return null
  }
}

// Cache for channel thumbnails to avoid repeated API calls
const thumbnailCache = new Map<string, string>()

export async function getChannelThumbnailCached(channelId: string): Promise<string> {
  if (!channelId) return '/placeholder.svg?height=40&width=40'
  
  // Check cache first
  if (thumbnailCache.has(channelId)) {
    return thumbnailCache.get(channelId)!
  }
  
  // Fetch from API
  const thumbnail = await getChannelThumbnail(channelId)
  
  if (thumbnail) {
    // Cache the result
    thumbnailCache.set(channelId, thumbnail)
    return thumbnail
  }
  
  return '/placeholder.svg?height=40&width=40'
} 