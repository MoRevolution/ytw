import { processAndStoreWatchHistoryByYear, isDataInIndexedDB } from "./indexeddb"
import { WATCH_HISTORY_FILE } from './constants'

async function fetchWatchHistory(accessToken: string) {
  try {
    console.log("🔑 Using access token:", accessToken ? "Token present" : "No token");
    
    const response = await fetch('/api/fetch-watch-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Response error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch watch history: ${response.status} - ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error: any) {
    console.error("❌ Error in fetchWatchHistory:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

export async function fetchAndProcessWatchHistory(accessToken: string, userId: string, forceRefresh: boolean = false) {
  try {
    // Only check for existing data if this is not a forced refresh
    if (!forceRefresh) {
      // Check for main watch history file
      const hasMainData = await isDataInIndexedDB(WATCH_HISTORY_FILE);
      
      // Get current year and past two years
      const currentYear = new Date().getFullYear();
      const years = [currentYear, currentYear - 1, currentYear - 2];
      
      // Check for year files
      const yearFilesExist = await Promise.all(
        years.map(year => isDataInIndexedDB(`watch-history-${year}`))
      );
      
      // Only skip if we have both the main file and the required year files
      if (hasMainData && yearFilesExist.every(exists => exists)) {
        console.log("📦 Watch history data and required year files already exist in IndexedDB");
        return;
      }
    }

    // Fetch watch history from YouTube API
    console.log("🔄 Starting watch history fetch...");
    const watchHistory = await fetchWatchHistory(accessToken);
    
    console.log("🔄 Processing and storing watch history data by year");
    await processAndStoreWatchHistoryByYear(watchHistory);
    
    // Update watch history status
    console.log("🔄 Updating watch history status...");
    const statusResponse = await fetch('/api/users/update-history-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: userId,
        hasWatchHistory: true,
      }),
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error("❌ Failed to update watch history status:", {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        body: errorText
      });
      throw new Error(`Failed to update watch history status: ${statusResponse.status}`);
    }

    console.log("✅ Watch history data processed and stored successfully");
  } catch (error) {
    console.error("❌ Error in fetchAndProcessWatchHistory:", error);
    throw error;
  }
} 