/**
 * Client-side metadata fetching with local cache + server API
 * 
 * Flow:
 * 1. Check local IndexedDB cache first (instant)
 * 2. Call server API for missing videos (API handles Redis cache + YouTube API)
 * 3. Store results in local IndexedDB for next time
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { YouTubeVideoMetadata, MetadataResponse } from '@/types/youtube';

// Re-export type for convenience
export type { YouTubeVideoMetadata };

// IndexedDB configuration
const DB_NAME = 'youtube-metadata-cache';
const STORE_NAME = 'metadata';
const DB_VERSION = 1;

/**
 * Get or create the IndexedDB database
 */
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        console.log('[Metadata] Created local cache store');
      }
    },
  });
}

/**
 * Read metadata from local IndexedDB cache
 */
async function getFromLocalCache(videoIds: string[]): Promise<Map<string, YouTubeVideoMetadata>> {
  const result = new Map<string, YouTubeVideoMetadata>();

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    await Promise.all(
      videoIds.map(async (id) => {
        const cached = await store.get(id) as YouTubeVideoMetadata | undefined;
        if (cached) {
          result.set(id, cached);
        }
      })
    );

    await tx.done;
  } catch (error) {
    console.warn('[Metadata] Local cache read error:', error);
  }

  return result;
}

/**
 * Save metadata to local IndexedDB cache
 */
async function saveToLocalCache(entries: Map<string, YouTubeVideoMetadata>): Promise<void> {
  if (entries.size === 0) return;

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const [id, metadata] of entries) {
      await store.put(metadata, id);
    }

    await tx.done;
    console.log(`[Metadata] Saved ${entries.size} to local cache`);
  } catch (error) {
    console.warn('[Metadata] Local cache write error:', error);
  }
}

/**
 * Fetch metadata from server API (which handles Redis + YouTube API)
 */
async function fetchFromServer(videoIds: string[]): Promise<Map<string, YouTubeVideoMetadata>> {
  const result = new Map<string, YouTubeVideoMetadata>();

  if (videoIds.length === 0) return result;

  try {
    // Split into chunks to avoid huge requests
    const CHUNK_SIZE = 500;
    
    for (let i = 0; i < videoIds.length; i += CHUNK_SIZE) {
      const chunk = videoIds.slice(i, i + CHUNK_SIZE);
      
      const response = await fetch('/api/videos/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds: chunk }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('[Metadata] Server API error:', response.status, error);
        continue;
      }

      const data: MetadataResponse = await response.json();
      
      for (const [id, metadata] of Object.entries(data.metadata)) {
        result.set(id, metadata);
      }

      console.log(`[Metadata] Server chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${data.cached} cached, ${data.fetched} fetched`);
    }
  } catch (error) {
    console.error('[Metadata] Server API error:', error);
  }

  return result;
}

/**
 * Get metadata for multiple videos
 * 
 * Uses multi-tier caching:
 * 1. Local IndexedDB (fastest, per-user)
 * 2. Server API which uses Redis (shared across users) + YouTube API
 * 
 * Never throws - returns partial results on error
 */
export async function getVideosMetadata(
  videoIds: string[]
): Promise<Map<string, YouTubeVideoMetadata>> {
  const startTime = Date.now();
  console.log(`[Metadata] Starting fetch for ${videoIds.length} videos`);

  // Deduplicate
  const uniqueIds = [...new Set(videoIds)];
  const metadataMap = new Map<string, YouTubeVideoMetadata>();

  try {
    // Step 1: Check local cache
    const localCached = await getFromLocalCache(uniqueIds);
    console.log(`[Metadata] Local cache: ${localCached.size}/${uniqueIds.length}`);
    
    for (const [id, metadata] of localCached) {
      metadataMap.set(id, metadata);
    }

    // Step 2: Fetch missing from server
    const missingIds = uniqueIds.filter(id => !metadataMap.has(id));
    
    if (missingIds.length > 0) {
      console.log(`[Metadata] Fetching ${missingIds.length} from server...`);
      
      const serverData = await fetchFromServer(missingIds);
      
      for (const [id, metadata] of serverData) {
        metadataMap.set(id, metadata);
      }

      // Step 3: Save newly fetched to local cache (background)
      if (serverData.size > 0) {
        saveToLocalCache(serverData).catch(err =>
          console.warn('[Metadata] Background cache save failed:', err)
        );
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Metadata] Complete: ${metadataMap.size}/${uniqueIds.length} in ${duration}ms`);

    return metadataMap;
  } catch (error) {
    console.error('[Metadata] Error:', error);
    // Return what we have
    return metadataMap;
  }
}

/**
 * Clear the local metadata cache
 */
export async function clearLocalMetadataCache(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.done;
    console.log('[Metadata] Local cache cleared');
  } catch (error) {
    console.warn('[Metadata] Failed to clear cache:', error);
  }
}
