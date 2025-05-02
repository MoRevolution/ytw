import { openDB, IDBPDatabase } from "idb"
import { getVideosMetadata  } from "./youtube-metadata"
import { DB_NAME, FILES_STORE, WATCH_HISTORY_FILE, AVAILABLE_YEARS_FILE } from './constants'

// Current database version - increment this when schema changes
const DB_VERSION = 1

/**
 * Initializes the database and ensures the object store exists
 * @returns A promise that resolves to the database instance
 */
async function initDB(): Promise<IDBPDatabase> {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(FILES_STORE)) {
          console.log(`🔄 Creating object store: ${FILES_STORE}`)
          db.createObjectStore(FILES_STORE, { keyPath: "fileName" })
        }
      },
    })

    // Verify the store exists
    if (!db.objectStoreNames.contains(FILES_STORE)) {
      throw new Error(`Failed to create object store: ${FILES_STORE}`)
    }

    return db
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

export async function isDataInIndexedDB(fileId: string): Promise<boolean> {
  try {
    const db = await initDB()
    const tx = db.transaction(FILES_STORE, "readonly")
    const store = tx.objectStore(FILES_STORE)
    const existingFile = await store.get(fileId)
    return !!existingFile
  } catch (error) {
    console.error("❌ Error checking IndexedDB:", error)
    return false
  }
}

export async function storeDataInIndexedDB(data: { [key: string]: string }) {
  let db: IDBPDatabase | null = null
  
  try {
    db = await initDB()
    
    // Check if we're in a secure context
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      throw new Error('IndexedDB operations require a secure context (HTTPS)')
    }
    
    // Check storage quota
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      console.log(`Storage quota: ${estimate.quota}, usage: ${estimate.usage}`)
    }

    const tx = db.transaction(FILES_STORE, "readwrite")
    const store = tx.objectStore(FILES_STORE)

    // Store all entries in a single transaction
    const putPromises = Object.entries(data).map(([fileName, content]) => 
      store.put({ fileName, content })
    )
    
    await Promise.all(putPromises)
    await tx.done
    
    console.log(`✅ Successfully stored ${Object.keys(data).length} items in IndexedDB`)
  } catch (error: unknown) {
    console.error("❌ Error storing data in IndexedDB:", error)
    // Add more context to the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const enhancedError = new Error(`Failed to store data in IndexedDB: ${errorMessage}`)
    enhancedError.name = 'IndexedDBError'
    throw enhancedError
  } finally {
    // Ensure database connection is closed
    if (db) {
      db.close()
    }
  }
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

  // Group data by year
  const dataByYear: { [year: string]: any[] } = {}
  const videoIdsByYear: { [year: string]: Set<string> } = {} 
  
  console.log('📅 Grouping entries by year...')
  watchHistoryData.forEach(entry => {
    if (!entry.time) {
      console.warn('⚠️ Entry missing time:', entry)
      return
    }
    
    const year = new Date(entry.time).getFullYear().toString()
    if (!dataByYear[year]) {
      dataByYear[year] = []
      videoIdsByYear[year] = new Set() 
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
    if (videoId) {
      videoIdsByYear[year].add(videoId) 
    }
  })

  console.log('📊 Data grouped by year:', Object.keys(dataByYear))

  // Store available years
  const availableYears = Object.keys(dataByYear).map(Number).sort((a, b) => b - a)
  console.log('📅 Storing available years:', availableYears)
  await storeDataInIndexedDB({
    [AVAILABLE_YEARS_FILE]: JSON.stringify(availableYears)
  })
  console.log('✅ Available years:', availableYears)

  // Get the two most recent complete years (excluding current year)
  const currentYear = new Date().getFullYear()
  const years = Object.keys(dataByYear)
    .map(Number)
    .filter(year => year < currentYear) // Only include past years
    .sort((a, b) => b - a) // Sort in descending order
    .slice(0, 2) // Take the two most recent
    .map(String) // Convert back to strings

  console.log('🎯 Processing years:', years)

  // Fetch metadata for videos from the most recent two complete years
  for (const year of years) {
    const videoIds = Array.from(videoIdsByYear[year])
    console.log(`📺 Year ${year}: Processing ${videoIds.length} videos`)
    
    if (videoIds.length > 0) {
      console.log(`🔄 Fetching metadata for ${videoIds.length} videos in ${year}...`)
      const metadataMap = await getVideosMetadata(videoIds)
      console.log(`✅ Retrieved metadata for ${metadataMap.size} videos in ${year}`)
      
      // Update entries with metadata
      let updatedCount = 0
      let skippedCount = 0
      dataByYear[year] = dataByYear[year].map(entry => {
        if (entry.video_id) {
          const metadata = metadataMap.get(entry.video_id)
          if (metadata) {
            updatedCount++
            return {
              ...entry,
              ...metadata,
              // Only update title if the new one is not empty
              title: metadata.title || entry.title || '',
            }
          } else {
            skippedCount++
          }
        }
        return entry
      })
      console.log(`📊 Year ${year}: Updated ${updatedCount} entries, skipped ${skippedCount}`)
    }
  }

  // Store all year data in a single transaction
  console.log('💾 Storing processed data...')
  await storeDataInIndexedDB(
    Object.fromEntries(
      Object.entries(dataByYear).map(([year, data]) => [
        `watch-history-${year}`,
        JSON.stringify(data)
      ])
    )
  )
  
  console.log('✅ Watch history processing complete!')
}

export async function isWatchHistoryDataComplete(): Promise<boolean> {
  try {
    // Check for main watch history file
    const hasMainData = await isDataInIndexedDB(WATCH_HISTORY_FILE);
    if (!hasMainData) {
      console.log("❌ Main watch history file not found");
      return false;
    }
    
    // Get available years from IndexedDB
    const availableYearsData = await isDataInIndexedDB(AVAILABLE_YEARS_FILE);
    if (!availableYearsData) {
      console.log("❌ Available years data not found");
      return false;
    }

    const db = await openDB(DB_NAME, 1);
    const tx = db.transaction(FILES_STORE, "readonly");
    const store = tx.objectStore(FILES_STORE);
    const data = await store.get(AVAILABLE_YEARS_FILE);
    
    if (!data) {
      console.log("❌ Could not read available years data");
      return false;
    }

    const years = JSON.parse(data.content);
    if (!Array.isArray(years) || years.length === 0) {
      console.log("❌ No available years found");
      return false;
    }
    
    // Check for year files
    const yearFilesExist = await Promise.all(
      years.map(year => isDataInIndexedDB(`watch-history-${year}`))
    );
    
    const allYearsExist = yearFilesExist.every(exists => exists);
    if (!allYearsExist) {
      console.log("❌ Not all year files exist");
      return false;
    }

    console.log("✅ All watch history data is complete");
    return true;
  } catch (error) {
    console.error("❌ Error checking watch history data completeness:", error);
    return false;
  }
} 