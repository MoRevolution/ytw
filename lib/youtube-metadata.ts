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
    // Process videos in smaller batches to avoid overwhelming Redis
    const BATCH_SIZE = 700;
    for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
      const batch = videoIds.slice(i, i + BATCH_SIZE);
      console.log(`🔄 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(videoIds.length/BATCH_SIZE)}`);
      
      // Process each batch with a small delay
      await Promise.all(
        batch.map(async (videoId) => {
          try {
            const cachedData = await redis.get(videoId);
            
            if (!cachedData) {
              missingIds.push(videoId);
              return;
            }

            try {
              const decodedBytes = Buffer.from(cachedData as string, "base64");
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
          } catch (error) {
            errorCount++;
            if (errorCount <= MAX_ERRORS) {
              console.error(`❌ Error processing video ${videoId}:`, error);
            }
            if (errorCount >= MAX_ERRORS) {
              throw new Error(`Too many errors (${errorCount}) while processing videos. Stopping...`);
            }
            missingIds.push(videoId);
          }
        })
      );
      
      // Add a small delay between batches
      if (i + BATCH_SIZE < videoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`📊 Found ${metadataMap.size} videos in cache, ${missingIds.length} to fetch from YouTube API`);
    if (errorCount > 0) {
      console.log(`⚠️ Encountered ${errorCount} errors while processing videos`);
    }

    // If we have videos to fetch from YouTube API
    if (missingIds.length > 0) {
      // YouTube API has a limit of 50 videos per request
      const BATCH_SIZE = 50;
      const batches = [];
      
      // Split missingIds into batches of 50
      for (let i = 0; i < missingIds.length; i += BATCH_SIZE) {
        batches.push(missingIds.slice(i, i + BATCH_SIZE));
      }

      console.log(`🔄 Fetching ${batches.length} batches of videos from YouTube API...`);

      // Process each batch with a delay to avoid rate limiting
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} videos)`);

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
            console.error("❌ YouTube API Error:", {
              status: response.status,
              statusText: response.statusText,
              body: errorText
            });
            throw new Error(`YouTube API error: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          
          if (!data.items) {
            console.warn("⚠️ No items returned from YouTube API");
            continue;
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

            // Cache in Redis
            const compressedEntry = deflateSync(JSON.stringify(metadata));
            const encodedEntry = Buffer.from(compressedEntry).toString("base64");
            await redis.set(video.id, encodedEntry);
          }

          // Add a delay between batches to avoid rate limiting
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
        } catch (error: any) {
          console.error(`❌ Error processing batch ${i + 1}:`, error.message);
          // Continue with next batch even if one fails
          continue;
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
