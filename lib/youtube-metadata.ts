import { deflateSync, unzipSync } from "zlib";
import { Buffer } from "buffer";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL!,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN!,
});

interface YouTubeVideoMetadata {
  video_id: string;
  title: string;
  channel: string;
  category_id: string;
  published_at: string;
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  made_for_kids: boolean;
  duration: string;
}

export async function getVideoMetadata(
  videoId: string
): Promise<YouTubeVideoMetadata | null> {
  try {
    const cachedData = await redis.get(videoId);
    if (cachedData) {
      const decodedBytes = Buffer.from(cachedData as string, "base64");
      const decompressedData = unzipSync(decodedBytes);
      return JSON.parse(decompressedData.toString("utf-8"));
    }

    // If not in cache, fetch from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics,contentDetails&` +
        `id=${videoId}&` +
        `key=${process.env.YOUTUBE_API_KEY}&` +
        `fields=items(` +
        `id,snippet(` +
        `title,channelTitle,categoryId,publishedAt,tags` +
        `),` +
        `statistics(` +
        `viewCount,likeCount,commentCount` +
        `),` +
        `contentDetails/duration` +
        `)`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video metadata");
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];
    const metadata: YouTubeVideoMetadata = {
      video_id: videoId,
      title: video.snippet?.title || "",
      channel: video.snippet?.channelTitle || "",
      category_id: video.snippet?.categoryId || "",
      published_at: video.snippet?.publishedAt || "",
      tags: video.snippet?.tags || [],
      view_count: parseInt(video.statistics?.viewCount || "0"),
      like_count: parseInt(video.statistics?.likeCount || "0"),
      comment_count: parseInt(video.statistics?.commentCount || "0"),
      made_for_kids:
        video.contentDetails?.contentRating?.ytRating === "ytAgeRestricted" ||
        false,
      duration: video.contentDetails?.duration || "",
    };

    const compressedEntry = deflateSync(JSON.stringify(metadata));
    const encodedEntry = Buffer.from(compressedEntry).toString("base64");
    await redis.set(videoId, encodedEntry);

    return metadata;
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    return null;
  }
}

export async function getVideosMetadata(
  videoIds: string[]
): Promise<Map<string, YouTubeVideoMetadata>> {
  console.log(`📥 Fetching metadata for ${videoIds.length} videos...`);

  const metadataMap = new Map<string, YouTubeVideoMetadata>();
  const missingIds: string[] = [];
  let errorCount = 0;
  const MAX_ERRORS = 5; // Maximum number of errors before stopping

  try {
    // Fetch all video metadata at once using MGET
    console.log(`🔄 Fetching metadata for ${videoIds.length} videos from Redis...`);
    const CHUNK_SIZE = 500;
    const CONCURRENT_CHUNKS = 5; // Number of chunks to process at once
    const chunks = [];
    const allCachedData: (string | null)[] = [];

    // Split videoIds into chunks of 1000
    for (let i = 0; i < videoIds.length; i += CHUNK_SIZE) {
      chunks.push(videoIds.slice(i, i + CHUNK_SIZE));
    }

    console.log(`📦 Processing ${chunks.length} chunks of ${CHUNK_SIZE} videos each (${CONCURRENT_CHUNKS} concurrent)...`);

    // Process chunks in groups with controlled concurrency
    for (let i = 0; i < chunks.length; i += CONCURRENT_CHUNKS) {
      const currentChunks = chunks.slice(i, i + CONCURRENT_CHUNKS);
      console.log(`🔄 Processing chunks ${i + 1}-${Math.min(i + CONCURRENT_CHUNKS, chunks.length)}/${chunks.length}...`);

      try {
        // Execute multiple MGET operations concurrently
        const chunkResults = await Promise.all(
          currentChunks.map(async (chunk, chunkIndex) => {
            const chunkData = await redis.mget(...chunk) as (string | null)[];
            if (!chunkData) {
              throw new Error(`Redis MGET returned no data for chunk ${i + chunkIndex + 1}`);
            }
            return chunkData;
          })
        );

        // Combine results
        chunkResults.forEach(result => {
          allCachedData.push(...result);
        });

        // Add delay between groups of chunks except for the last group
        if (i + CONCURRENT_CHUNKS < chunks.length) {
          console.log(`⏳ Waiting 1 second before next group of chunks...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        console.error("❌ Redis MGET Error:", {
          error: error.message,
          stack: error.stack,
          chunkGroup: `${i + 1}-${Math.min(i + CONCURRENT_CHUNKS, chunks.length)}`,
          totalChunks: chunks.length,
          videoCount: currentChunks.reduce((sum, chunk) => sum + chunk.length, 0)
        });
        throw new Error("Failed to retrieve data from Redis: " + error.message);
      }
    }

    // Process the results
    allCachedData.forEach((data, index) => {
      const videoId = videoIds[index];
      
      if (!data) {
        missingIds.push(videoId);
        return;
      }

      try {
        const decodedBytes = Buffer.from(data as string, "base64");
        const decompressedData = unzipSync(decodedBytes);
        const jsonString = decompressedData.toString('utf8');
        const metadata = JSON.parse(jsonString);
        metadataMap.set(videoId, metadata);
      } catch (parseError) {
        errorCount++;
        if (errorCount <= MAX_ERRORS) {
          console.error(`❌ Error processing video ${videoId}:`, parseError);
        }
        if (errorCount >= MAX_ERRORS) {
          throw new Error(`Too many errors (${errorCount}) while processing videos. Stopping...`);
        }
        missingIds.push(videoId);
      }
    });

    console.log(`📊 Found ${metadataMap.size} videos in cache, ${missingIds.length} to fetch from YouTube API`);
    if (errorCount > 0) {
      console.log(`⚠️ Encountered ${errorCount} errors while processing videos`);
    }

    // If we have videos to fetch from YouTube API
    if (missingIds.length > 0) {
      // YouTube API has a limit of 50 videos per request
      const BATCH_SIZE = 50;
      const CONCURRENCY_LIMIT = 5; 
      const batches = [];
      const cacheEntries: Record<string, string> = {};
      
      for (let i = 0; i < missingIds.length; i += BATCH_SIZE) {
        batches.push(missingIds.slice(i, i + BATCH_SIZE));
      }

      console.log(`🔄 Fetching ${batches.length} batches of videos from YouTube API (${CONCURRENCY_LIMIT} concurrent)...`);

      // Process batches with controlled concurrency
      const processBatch = async (batch: string[], index: number) => {
        console.log(`📦 Processing batch ${index + 1}/${batches.length} (${batch.length} videos)`);

        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
              `part=snippet,statistics,contentDetails&` +
              `id=${batch.join(",")}&` +
              `key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&` +
              `fields=items(` +
              `id,snippet(` +
              `title,channelTitle,categoryId,publishedAt,tags` +
              `),` +
              `statistics(` +
              `viewCount,likeCount,commentCount` +
              `),` +
              `contentDetails/duration` +
              `)`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            const errorDetails = {
              status: response.status,
              statusText: response.statusText,
              body: errorText,
              batchIndex: index + 1,
              totalBatches: batches.length,
              videoIds: batch
            };
            console.error("❌ YouTube API Error:", errorDetails);
            throw new Error(`YouTube API error: ${response.status} - ${response.statusText}\nResponse: ${errorText}`);
          }

          const data = await response.json();
          
          if (!data.items) {
            console.warn("⚠️ No items returned from YouTube API for batch:", {
              batchIndex: index + 1,
              totalBatches: batches.length,
              videoIds: batch
            });
            return;
          }

          // Process each video in the batch
          for (const video of data.items) {
            const metadata: YouTubeVideoMetadata = {
              video_id: video.id,
              title: video.snippet?.title || "",
              channel: video.snippet?.channelTitle || "",
              category_id: video.snippet?.categoryId || "",
              published_at: video.snippet?.publishedAt || "",
              tags: video.snippet?.tags || [],
              view_count: parseInt(video.statistics?.viewCount || "0"),
              like_count: parseInt(video.statistics?.likeCount || "0"),
              comment_count: parseInt(video.statistics?.commentCount || "0"),
              made_for_kids: video.contentDetails?.contentRating?.ytRating === "ytAgeRestricted" || false,
              duration: video.contentDetails?.duration || "",
            };

            // Store in memory
            metadataMap.set(video.id, metadata);

            // Prepare for Redis caching
            const compressedEntry = deflateSync(JSON.stringify(metadata));
            const encodedEntry = Buffer.from(compressedEntry).toString("base64");
            cacheEntries[video.id] = encodedEntry;
          }
        } catch (error: any) {
          console.error(`❌ Error processing batch ${index + 1}:`, error.message);
        }
      };

      // Process batches with controlled concurrency
      for (let i = 0; i < batches.length; i += CONCURRENCY_LIMIT) {
        const currentBatches = batches.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(currentBatches.map((batch, index) => processBatch(batch, i + index)));
        
        // Add a small delay between groups of concurrent requests
        if (i + CONCURRENCY_LIMIT < batches.length) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay between groups
        }
      }

      // Cache all entries in Redis at once using MSET
      if (Object.keys(cacheEntries).length > 0) {
        console.log(`🔄 Caching ${Object.keys(cacheEntries).length} videos in Redis...`);
        
        const CACHE_CHUNK_SIZE = 500;
        const entries = Object.entries(cacheEntries);
        const chunks = [];
        
        // Split entries into chunks of 10,000
        for (let i = 0; i < entries.length; i += CACHE_CHUNK_SIZE) {
          chunks.push(entries.slice(i, i + CACHE_CHUNK_SIZE));
        }

        console.log(`📦 Caching in ${chunks.length} chunks of up to ${CACHE_CHUNK_SIZE} entries each...`);

        // Process each chunk with a delay
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkObject = Object.fromEntries(chunk);
          
          console.log(`🔄 Caching chunk ${i + 1}/${chunks.length} (${chunk.length} entries)...`);
          await redis.mset(chunkObject);
          
          // Add delay between chunks except for the last one
          if (i < chunks.length - 1) {
            console.log(`⏳ Waiting 2 seconds before next cache chunk...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }

    console.log(`✅ Successfully processed ${metadataMap.size} videos`);
    return metadataMap;
  } catch (error: any) {
    console.error("❌ Error in getVideosMetadata:", error.message);
    throw error;
  }
}
