import { processAndStoreWatchHistoryByYear as processWatchHistory } from './indexeddb';

export async function processAndStoreWatchHistoryByYear(watchHistory: any[]): Promise<void> {
  try {
    console.log('📊 Starting watch history processing...');
    console.log(`📥 Total entries to process: ${watchHistory.length}`);
    
    await processWatchHistory(watchHistory);

    console.log('✅ Watch history data processed and stored successfully');
  } catch (error) {
    console.error('❌ Error processing watch history:', error);
    throw error;
  }
} 