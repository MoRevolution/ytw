import { openDB } from "idb"
import { getVideosMetadata } from "./youtube-metadata"

export async function isDataInIndexedDB(fileId: string): Promise<boolean> {
  const db = await openDB("youtube-wrapped", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "fileName" })
      }
    },
  })

  const tx = db.transaction("files", "readonly")
  const store = tx.objectStore("files")
  const existingFile = await store.get(fileId)

  return !!existingFile
}

export async function storeDataInIndexedDB(data: { [key: string]: string }) {
  const db = await openDB("youtube-wrapped", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "fileName" })
      }
    },
  })

  const tx = db.transaction("files", "readwrite")
  const store = tx.objectStore("files")

  for (const [fileName, content] of Object.entries(data)) {
    await store.put({ fileName, content })
  }

  await tx.done
  console.log("Data stored in IndexedDB successfully")
}

/**
 * Processes YouTube watch history data by:
 * 1. Grouping entries by year
 * 2. Extracting video IDs and basic metadata
 * 3. Fetching detailed metadata for videos from the two most recent complete years
 * 4. Storing the processed data in IndexedDB
 * 
 * @param watchHistoryData - Array of raw watch history entries from YouTube
 */
export async function processAndStoreWatchHistoryByYear(watchHistoryData: any[]) {
  const db = await openDB("youtube-wrapped", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "fileName" })
      }
    },
  })

  const tx = db.transaction("files", "readwrite")
  const store = tx.objectStore("files")

  // Group data by year
  const dataByYear: { [year: string]: any[] } = {}
  const videoIdsByYear: { [year: string]: Set<string> } = {}
  
  watchHistoryData.forEach(entry => {
    if (!entry.time) return
    
    const year = new Date(entry.time).getFullYear().toString()
    if (!dataByYear[year]) {
      dataByYear[year] = []
      videoIdsByYear[year] = new Set()
    }

    // Extract video ID from URL
    const videoIdMatch = entry.titleUrl?.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null

    // Create processed entry
    const processedEntry = {
      title: entry.title,
      video_id: videoId,
      channel_name: entry.subtitles?.[0]?.name || null,
      channel_url: entry.subtitles?.[0]?.url || null,
      time_watched: entry.time
    }

    dataByYear[year].push(processedEntry)
    if (videoId) {
      videoIdsByYear[year].add(videoId)
    }
  })

  // Get the two most recent complete years (excluding current year)
  const currentYear = new Date().getFullYear()
  const years = Object.keys(dataByYear)
    .map(Number)
    .filter(year => year < currentYear) // Only include past years
    .sort((a, b) => b - a) // Sort in descending order
    .slice(0, 2) // Take the two most recent
    .map(String) // Convert back to strings

  // Fetch metadata for videos from the most recent two complete years
  for (const year of years) {
    const videoIds = Array.from(videoIdsByYear[year])
    if (videoIds.length > 0) {
      const metadataMap = await getVideosMetadata(videoIds)
      
      // Update entries with metadata
      dataByYear[year] = dataByYear[year].map(entry => {
        if (entry.video_id) {
          const metadata = metadataMap.get(entry.video_id)
          if (metadata) {
            return {
              ...entry,
              ...metadata
            }
          }
        }
        return entry
      })
    }
  }

  // Store each year's data separately
  for (const [year, data] of Object.entries(dataByYear)) {
    const fileName = `watch-history-${year}`
    await store.put({ 
      fileName, 
      content: JSON.stringify(data)
    })
  }

  await tx.done
  console.log("✅ Processed and stored watch history data by year")
} 