import { openDB } from "idb"
import { getVideosMetadata } from "./youtube-metadata"
import { DB_NAME, FILES_STORE, WATCH_HISTORY_FILE } from './constants'

export async function isDataInIndexedDB(fileId: string): Promise<boolean> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: "fileName" })
      }
    },
  })

  const tx = db.transaction(FILES_STORE, "readonly")
  const store = tx.objectStore(FILES_STORE)
  const existingFile = await store.get(fileId)

  return !!existingFile
}

export async function storeDataInIndexedDB(data: { [key: string]: string }) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: "fileName" })
      }
    },
  })

  const tx = db.transaction(FILES_STORE, "readwrite")
  const store = tx.objectStore(FILES_STORE)

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
  console.log('📊 Starting watch history processing...')
  console.log(`📥 Total entries to process: ${watchHistoryData.length}`)

  // First store the raw data as backup
  console.log('💾 Storing raw watch history data...')
  await storeDataInIndexedDB({
    [WATCH_HISTORY_FILE]: JSON.stringify(watchHistoryData)
  })
  console.log('✅ Raw watch history data stored successfully')

  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: "fileName" })
      }
    },
  })

  const tx = db.transaction(FILES_STORE, "readwrite")
  const store = tx.objectStore(FILES_STORE)

  // Group data by year
  const dataByYear: { [year: string]: any[] } = {}
  // const videoIdsByYear: { [year: string]: Set<string> } = {} // Commented out for now
  
  console.log('📅 Grouping entries by year...')
  watchHistoryData.forEach(entry => {
    if (!entry.time) {
      console.warn('⚠️ Entry missing time:', entry)
      return
    }
    
    const year = new Date(entry.time).getFullYear().toString()
    if (!dataByYear[year]) {
      dataByYear[year] = []
      // videoIdsByYear[year] = new Set() // Commented out for now
    }

    // Extract video ID from URL
    const videoIdMatch = entry.titleUrl?.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null

    if (!videoId) {
      console.warn('⚠️ Could not extract video ID from URL:', entry.titleUrl)
    }

    // Create processed entry
    const processedEntry = {
      title: entry.title,
      video_id: videoId,
      channel_name: entry.subtitles?.[0]?.name || null,
      channel_url: entry.subtitles?.[0]?.url || null,
      time_watched: entry.time
    }

    dataByYear[year].push(processedEntry)
    // if (videoId) {
    //   videoIdsByYear[year].add(videoId) // Commented out for now
    // }
  })

  console.log('📊 Data grouped by year:', Object.keys(dataByYear))

  // Get the two most recent complete years (excluding current year)
  // const currentYear = new Date().getFullYear()
  // const years = Object.keys(dataByYear)
  //   .map(Number)
  //   .filter(year => year < currentYear) // Only include past years
  //   .sort((a, b) => b - a) // Sort in descending order
  //   .slice(0, 2) // Take the two most recent
  //   .map(String) // Convert back to strings

  // console.log('🎯 Processing years:', years)

  // Fetch metadata for videos from the most recent two complete years
  // for (const year of years) {
  //   const videoIds = Array.from(videoIdsByYear[year])
  //   console.log(`📺 Year ${year}: Processing ${videoIds.length} videos`)
    
  //   if (videoIds.length > 0) {
  //     console.log(`🔄 Fetching metadata for ${videoIds.length} videos in ${year}...`)
  //     const metadataMap = await getVideosMetadata(videoIds)
  //     console.log(`✅ Retrieved metadata for ${metadataMap.size} videos in ${year}`)
      
  //     // Update entries with metadata
  //     let updatedCount = 0
  //     let skippedCount = 0
  //     dataByYear[year] = dataByYear[year].map(entry => {
  //       if (entry.video_id) {
  //         const metadata = metadataMap.get(entry.video_id)
  //         if (metadata) {
  //           updatedCount++
  //           return {
  //             ...entry,
  //             ...metadata,
  //             // Only update title if the new one is not empty
  //             title: metadata.title || entry.title || '',
  //           }
  //         } else {
  //           skippedCount++
  //           console.warn(`⚠️ No metadata found for video ID: ${entry.video_id}`)
  //         }
  //       }
  //       return entry
  //     })
  //     console.log(`📊 Year ${year}: Updated ${updatedCount} entries, skipped ${skippedCount}`)
  //   }
  // }

  // Store each year's data separately
  console.log('💾 Storing processed data...')
  for (const [year, data] of Object.entries(dataByYear)) {
    const fileName = `watch-history-${year}`
    console.log(`📁 Storing ${data.length} entries for year ${year}...`)
    await store.put({ 
      fileName, 
      content: JSON.stringify(data)
    })
  }

  await tx.done
  console.log('✅ Watch history processing complete!')
} 