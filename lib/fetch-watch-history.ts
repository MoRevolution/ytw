import { openDB } from 'idb';
import { processAndStoreWatchHistoryByYear } from "./indexeddb"

async function checkForExistingData(): Promise<boolean> {
  try {
    const db = await openDB('youtube-wrapped', 1);
    const tx = db.transaction('watchHistory', 'readonly');
    const store = tx.objectStore('watchHistory');
    const count = await store.count();
    return count > 0;
  } catch (error) {
    console.error("Error checking for existing data:", error);
    return false;
  }
}

async function fetchWatchHistory(accessToken: string) {
  const response = await fetch('/api/fetch-watch-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch watch history: ${response.status}`);
  }

  const { data } = await response.json();
  return data;
}

export async function fetchAndProcessWatchHistory(accessToken: string, userId: string) {
  try {
    // Check if we already have data in IndexedDB
    const hasData = await checkForExistingData();
    if (hasData) {
      console.log("📦 Watch history data already exists in IndexedDB");
      return;
    }

    // Fetch watch history from YouTube API
    const watchHistory = await fetchWatchHistory(accessToken);
    
    // Process and store the data
    await processAndStoreWatchHistoryByYear(watchHistory);
    
    // Update watch history status
    await fetch('/api/users/update-history-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: userId,
        hasWatchHistory: true,
      }),
    });

    console.log("✅ Watch history data processed and stored successfully");
  } catch (error) {
    console.error("❌ Error in fetchAndProcessWatchHistory:", error);
    throw error;
  }
} 