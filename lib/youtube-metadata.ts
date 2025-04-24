import { deflateSync, unzipSync } from 'zlib'
import { Buffer } from 'buffer'
import { Redis } from '@upstash/redis'

// TODO: Install @upstash/redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface YouTubeVideoMetadata {
  video_id: string
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

export async function getVideoMetadata(videoId: string): Promise<YouTubeVideoMetadata | null> {
  try {
    const cachedData = await redis.get(videoId)
    if (cachedData) {
      const decodedBytes = Buffer.from(cachedData as string, 'base64')
      const decompressedData = unzipSync(decodedBytes)
      return JSON.parse(decompressedData.toString('utf-8'))
    }

    // If not in cache, fetch from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,statistics,contentDetails&` +
      `id=${videoId}&` +
      `key=${process.env.YOUTUBE_API_KEY}&` +
      `fields=items(` +
        `id,snippet(` +
          `channelTitle,categoryId,publishedAt,tags` +
        `),` +
        `statistics(` +
          `viewCount,likeCount,commentCount` +
        `),` +
        `contentDetails/duration` +
      `)`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch video metadata')
    }

    const data = await response.json()
    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]
    const metadata: YouTubeVideoMetadata = {
      video_id: videoId,
      channel: video.snippet.channelTitle,
      category_id: video.snippet.categoryId,
      published_at: video.snippet.publishedAt,
      tags: video.snippet.tags || [],
      view_count: parseInt(video.statistics.viewCount),
      like_count: parseInt(video.statistics.likeCount),
      comment_count: parseInt(video.statistics.commentCount),
      made_for_kids: video.contentDetails.contentRating?.ytRating === 'ytAgeRestricted',
      duration: video.contentDetails.duration,
    }

    const compressedEntry = deflateSync(JSON.stringify(metadata))
    const encodedEntry = Buffer.from(compressedEntry).toString('base64')
    await redis.set(videoId, encodedEntry)

    return metadata
  } catch (error) {
    console.error('Error fetching video metadata:', error)
    return null
  }
}

export async function getVideosMetadata(videoIds: string[]): Promise<Map<string, YouTubeVideoMetadata>> {
  const metadataMap = new Map<string, YouTubeVideoMetadata>()
  const missingIds: string[] = []

  // First try to get all from cache
  for (const videoId of videoIds) {
    const cachedData = await redis.get(videoId)
    if (cachedData) {
      const decodedBytes = Buffer.from(cachedData as string, 'base64')
      const decompressedData = unzipSync(decodedBytes)
      metadataMap.set(videoId, JSON.parse(decompressedData.toString('utf-8')))
    } else {
      missingIds.push(videoId)
    }
  }

  // Fetch missing videos in batches of 50
  for (let i = 0; i < missingIds.length; i += 50) {
    const batch = missingIds.slice(i, i + 50)
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${batch.join(',')}&key=${process.env.YOUTUBE_API_KEY}&maxResults=50&fields=items(id,snippet(channelTitle,categoryId,publishedAt,tags),statistics(viewCount,likeCount,commentCount),contentDetails/duration)`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch batch metadata')
      continue
    }

    const data = await response.json()
    if (!data.items) continue

    for (const video of data.items) {
      const metadata: YouTubeVideoMetadata = {
        video_id: video.id,
        channel: video.snippet.channelTitle,
        category_id: video.snippet.categoryId,
        published_at: video.snippet.publishedAt,
        tags: video.snippet.tags || [],
        view_count: parseInt(video.statistics.viewCount),
        like_count: parseInt(video.statistics.likeCount),
        comment_count: parseInt(video.statistics.commentCount),
        made_for_kids: video.contentDetails.contentRating?.ytRating === 'ytAgeRestricted',
        duration: video.contentDetails.duration,
      }

      metadataMap.set(video.id, metadata)

      const compressedEntry = deflateSync(JSON.stringify(metadata))
      const encodedEntry = Buffer.from(compressedEntry).toString('base64')
      await redis.set(video.id, encodedEntry)
    }
  }

  return metadataMap
} 