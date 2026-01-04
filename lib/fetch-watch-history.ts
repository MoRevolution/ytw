import { processAndStoreWatchHistoryByYear} from "./indexeddb"
import { logger } from "./logger"

async function fetchWatchHistory(accessToken: string) {
  try {
    console.log("Using access token:", accessToken ? "Token present" : "No token");
    
    const response = await fetch('/api/fetch-watch-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("API Response error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // If the error is due to no Takeout folder found
      if (response.status === 404) {
        throw new Error('NO_TAKEOUT_FOLDER');
      }
      
      throw new Error(`Failed to fetch watch history: ${response.status} - ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error: any) {
    logger.error("Error in fetchWatchHistory:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

export async function fetchAndProcessWatchHistory(accessToken: string, userId: string): Promise<boolean> {
  try {
    // Fetch watch history from YouTube API
    try {
      const watchHistory = await fetchWatchHistory(accessToken);
      console.log("Processing and storing watch history data by year");
      await processAndStoreWatchHistoryByYear(watchHistory);
    } catch (error: any) {
      if (error.message === 'NO_TAKEOUT_FOLDER') {
        // Redirect to takeout instructions page
        window.location.href = '/takeout-instructions';
        return false;
      }
      throw error;
    }
    
    // Update watch history status
    console.log("Updating watch history status...");
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
      logger.error("Failed to update watch history status:", {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        body: errorText
      });
      throw new Error(`Failed to update watch history status: ${statusResponse.status}`);
    }

    console.log("Watch history data processed and stored successfully");
    return true;
  } catch (error) {
    logger.error("Error in fetchAndProcessWatchHistory:", error);
    throw error;
  }
} 