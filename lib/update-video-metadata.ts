import { getVideosMetadata } from './youtube-metadata'
import { openDB } from 'idb'

interface VideoRecord {
  id: string
  video_id: string
  title: string
  time_watched: string
  channel: string
  category_id: string
  published_at: string
  tags: string[]
  view_count: number
  like_count: number
  comment_count: number
  made_for_kids: boolean
  duration: string
}

export async function updateVideoMetadata() {
  const db = await openDB('youtube-wrapped', 1)
  const tx = db.transaction('watch-history', 'readwrite')
  const store = tx.objectStore('watch-history')

  // Get all videos from the past two years
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  
  const videos = await store.getAll()
  const recentVideos = videos.filter(video => {
    const watchedDate = new Date(video.time_watched)
    return watchedDate >= twoYearsAgo
  })

  // Get unique video IDs
  const videoIds = [...new Set(recentVideos.map(video => video.video_id))]

  // Fetch metadata for all videos
  const metadataMap = await getVideosMetadata(videoIds)

  // Update each video record with its metadata
  for (const video of recentVideos) {
    const metadata = metadataMap.get(video.video_id)
    if (metadata) {
      const updatedVideo: VideoRecord = {
        ...video,
        channel: metadata.channel,
        category_id: metadata.category_id,
        published_at: metadata.published_at,
        tags: metadata.tags,
        view_count: metadata.view_count,
        like_count: metadata.like_count,
        comment_count: metadata.comment_count,
        made_for_kids: metadata.made_for_kids,
        duration: metadata.duration,
      }
      await store.put(updatedVideo)
    }
  }

  await tx.done
  return recentVideos.length
} 