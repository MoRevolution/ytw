import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { deflateSync, unzipSync } from 'zlib';
import type { YouTubeVideoMetadata, MetadataResponse } from '@/types/youtube';

// Initialize Redis (server-side only)
// Uses non-public vars if available, falls back to NEXT_PUBLIC_ vars
let redis: Redis | null = null;
try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('[Metadata API] Redis initialized');
  } else {
    console.log('[Metadata API] Redis not configured, caching disabled');
  }
} catch (e) {
  console.warn('[Metadata API] Failed to initialize Redis:', e);
}

// Constants - use non-public vars if available, fall back to NEXT_PUBLIC_
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BATCH_SIZE = 50; // YouTube API limit
const REDIS_CHUNK_SIZE = 100;

/**
 * Compress and encode metadata for Redis storage
 */
function compressMetadata(metadata: YouTubeVideoMetadata): string {
  const compressed = deflateSync(JSON.stringify(metadata));
  return Buffer.from(compressed).toString('base64');
}

/**
 * Decompress and decode metadata from Redis storage
 */
function decompressMetadata(data: string): YouTubeVideoMetadata | null {
  try {
    const buffer = Buffer.from(data, 'base64');
    const decompressed = unzipSync(buffer);
    return JSON.parse(decompressed.toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * Fetch metadata from Redis cache
 */
async function getFromCache(videoIds: string[]): Promise<Map<string, YouTubeVideoMetadata>> {
  const result = new Map<string, YouTubeVideoMetadata>();
  
  if (!redis || videoIds.length === 0) {
    return result;
  }

  try {
    // Process in chunks to avoid overwhelming Redis
    for (let i = 0; i < videoIds.length; i += REDIS_CHUNK_SIZE) {
      const chunk = videoIds.slice(i, i + REDIS_CHUNK_SIZE);
      const keys = chunk.map(id => `yt:${id}`);
      
      const cached = await redis.mget<string[]>(...keys);
      
      cached.forEach((data, index) => {
        if (data) {
          const metadata = decompressMetadata(data);
          if (metadata) {
            result.set(chunk[index], metadata);
          }
        }
      });
    }
  } catch (error) {
    console.warn('[Metadata API] Cache read error:', error);
  }

  return result;
}

/**
 * Save metadata to Redis cache
 */
async function saveToCache(entries: Map<string, YouTubeVideoMetadata>): Promise<void> {
  if (!redis || entries.size === 0) {
    return;
  }

  try {
    const entriesArray = Array.from(entries.entries());
    
    for (let i = 0; i < entriesArray.length; i += REDIS_CHUNK_SIZE) {
      const chunk = entriesArray.slice(i, i + REDIS_CHUNK_SIZE);
      const pipeline = redis.pipeline();
      
      for (const [id, metadata] of chunk) {
        const compressed = compressMetadata(metadata);
        pipeline.set(`yt:${id}`, compressed);
      }
      
      await pipeline.exec();
    }
    
    console.log(`[Metadata API] Cached ${entries.size} videos`);
  } catch (error) {
    console.warn('[Metadata API] Cache write error:', error);
  }
}

/**
 * Fetch metadata from YouTube API
 */
async function fetchFromYouTube(videoIds: string[]): Promise<Map<string, YouTubeVideoMetadata>> {
  const result = new Map<string, YouTubeVideoMetadata>();
  
  if (!YOUTUBE_API_KEY || videoIds.length === 0) {
    if (!YOUTUBE_API_KEY) {
      console.warn('[Metadata API] YOUTUBE_API_KEY not configured');
    }
    return result;
  }

  // Process in batches of 50 (YouTube API limit)
  for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
    const batch = videoIds.slice(i, i + BATCH_SIZE);
    
    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/videos');
      url.searchParams.set('part', 'snippet,statistics,contentDetails');
      url.searchParams.set('id', batch.join(','));
      url.searchParams.set('key', YOUTUBE_API_KEY);
      url.searchParams.set('fields', 
        'items(id,snippet(title,channelTitle,categoryId,publishedAt,tags),' +
        'statistics(viewCount,likeCount,commentCount),contentDetails/duration)'
      );

      const response = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Metadata API] YouTube API error ${response.status}:`, errorText);
        continue;
      }

      const data = await response.json();
      
      if (!data.items) {
        continue;
      }

      for (const video of data.items) {
        const metadata: YouTubeVideoMetadata = {
          video_id: video.id,
          title: video.snippet?.title || '',
          channel: video.snippet?.channelTitle || '',
          category_id: video.snippet?.categoryId || '',
          published_at: video.snippet?.publishedAt || '',
          tags: video.snippet?.tags || [],
          view_count: parseInt(video.statistics?.viewCount || '0', 10),
          like_count: parseInt(video.statistics?.likeCount || '0', 10),
          comment_count: parseInt(video.statistics?.commentCount || '0', 10),
          made_for_kids: video.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted',
          duration: video.contentDetails?.duration || '',
        };
        result.set(video.id, metadata);
      }
      
      console.log(`[Metadata API] Fetched batch ${Math.floor(i / BATCH_SIZE) + 1}: ${data.items.length} videos`);
      
      // Small delay between batches to be nice to YouTube API
      if (i + BATCH_SIZE < videoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`[Metadata API] Batch error:`, error);
    }
  }

  return result;
}

/**
 * POST /api/videos/metadata
 * 
 * Request body: { videoIds: string[] }
 * Response: { metadata: Record<string, YouTubeVideoMetadata>, cached: number, fetched: number, failed: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoIds } = body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { error: 'videoIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Deduplicate and filter valid IDs
    const uniqueIds = [...new Set(videoIds)].filter(id => 
      typeof id === 'string' && id.length > 0
    );

    console.log(`[Metadata API] Request for ${uniqueIds.length} videos`);

    const metadata: Record<string, YouTubeVideoMetadata> = {};
    let cachedCount = 0;
    let fetchedCount = 0;

    // Step 1: Check Redis cache
    const cachedMetadata = await getFromCache(uniqueIds);
    cachedCount = cachedMetadata.size;
    
    for (const [id, data] of cachedMetadata) {
      metadata[id] = data;
    }

    // Step 2: Fetch missing from YouTube API
    const missingIds = uniqueIds.filter(id => !metadata[id]);
    
    if (missingIds.length > 0) {
      console.log(`[Metadata API] Cache hit: ${cachedCount}, fetching ${missingIds.length} from YouTube`);
      
      const fetchedMetadata = await fetchFromYouTube(missingIds);
      fetchedCount = fetchedMetadata.size;
      
      for (const [id, data] of fetchedMetadata) {
        metadata[id] = data;
      }

      // Step 3: Cache newly fetched metadata (fire and forget)
      if (fetchedMetadata.size > 0) {
        saveToCache(fetchedMetadata).catch(err => 
          console.warn('[Metadata API] Background cache save failed:', err)
        );
      }
    }

    const failedCount = uniqueIds.length - cachedCount - fetchedCount;

    const response: MetadataResponse = {
      metadata,
      cached: cachedCount,
      fetched: fetchedCount,
      failed: failedCount,
    };

    console.log(`[Metadata API] Response: ${cachedCount} cached, ${fetchedCount} fetched, ${failedCount} failed`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Metadata API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
