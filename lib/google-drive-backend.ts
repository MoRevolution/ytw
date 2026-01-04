import { google } from "googleapis";
import JSZip from "jszip";

// Initialize Google Drive API client
const drive = google.drive("v3");

// Target path for watch history in the ZIP
const TARGET_FILE_PATH = "Takeout/YouTube and YouTube Music/history/watch-history.json";

/**
 * Extract the base timestamp from a Takeout filename.
 * e.g., "takeout-20260103T224344Z-001.zip" -> "20260103T224344Z"
 * e.g., "takeout-20260103T224344Z-3-001.zip" -> "20260103T224344Z"
 */
function extractTakeoutTimestamp(filename: string): string | null {
  // Match pattern: takeout-TIMESTAMP-... or takeout-TIMESTAMP-N-...
  const match = filename.match(/takeout-(\d{8}T\d{6}Z)/i);
  return match ? match[1] : null;
}

/**
 * Group Takeout files by their export session (same timestamp = same export)
 */
function groupTakeoutFiles(files: { id?: string | null; name?: string | null; createdTime?: string | null }[]): Map<string, typeof files> {
  const groups = new Map<string, typeof files>();
  
  for (const file of files) {
    if (!file.name) continue;
    const timestamp = extractTakeoutTimestamp(file.name);
    if (timestamp) {
      if (!groups.has(timestamp)) {
        groups.set(timestamp, []);
      }
      groups.get(timestamp)!.push(file);
    }
  }
  
  return groups;
}

/**
 * Fetches Takeout zip files from Google Drive, searches through multi-part exports,
 * extracts the `watch-history.json` file, and returns its contents.
 * @param {string} accessToken - The Google OAuth access token.
 * @returns {Promise<object>} - The parsed contents of `watch-history.json`.
 */
export async function fetchAndExtractZip(accessToken: string): Promise<object> {
  console.log('\n---------- fetchAndExtractZip ----------');
  console.log('[Drive] Starting fetch, token length:', accessToken?.length);
  
  try {
    // Set up and authenticate
    console.log('[Drive Step 1] Setting up OAuth client...');
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });
    console.log('[Drive Step 1] OAuth client ready');

    // Search for Takeout files - get more to handle multi-part exports
    console.log('[Drive Step 2] Searching for Takeout ZIP files...');
    
    const fileList = await drive.files.list({
      auth: authClient,
      q: "name contains 'takeout' and mimeType='application/x-zip'",
      orderBy: 'createdTime desc',
      pageSize: 50, // Get more files to find all parts
      fields: 'files(id, name, mimeType, createdTime)',
    });

    const files = fileList.data.files;
    console.log('[Drive Step 2] Total ZIP files found:', files?.length ?? 0);
    
    if (!files?.length) {
      console.log('[Drive Step 2] FAILED: No Takeout files found');
      throw new Error("No Takeout zip files found in Google Drive. Make sure you exported to 'Add to Drive' in Google Takeout.");
    }
    
    // Log all files found
    files.forEach((f, i) => {
      console.log(`[Drive Step 2]   [${i}] ${f.name} - ${f.createdTime}`);
    });

    // Group files by export session
    const groups = groupTakeoutFiles(files);
    console.log('[Drive Step 3] Found', groups.size, 'distinct Takeout export session(s)');
    
    // Get the most recent export session (sorted by timestamp)
    const sortedTimestamps = Array.from(groups.keys()).sort().reverse();
    
    for (const timestamp of sortedTimestamps) {
      const sessionFiles = groups.get(timestamp)!;
      console.log(`[Drive Step 3] Checking export session: ${timestamp} (${sessionFiles.length} part(s))`);
      
      // Search through each part of this export session
      for (const file of sessionFiles) {
        console.log(`[Drive Step 4] Downloading: ${file.name} (id: ${file.id})`);
        
        try {
          const response = await drive.files.get({
            auth: authClient,
            fileId: file.id!,
            alt: "media",
          }, { responseType: "arraybuffer" });

          if (!response.data) {
            console.log('[Drive Step 4] No data received, skipping...');
            continue;
          }
          
          const size = (response.data as ArrayBuffer).byteLength;
          console.log(`[Drive Step 4] Downloaded ${size} bytes`);

          // Process the zip file
          const zipBuffer = Buffer.from(response.data as ArrayBuffer);
          const zip = await JSZip.loadAsync(zipBuffer);
          const zipFileNames = Object.keys(zip.files);
          
          console.log(`[Drive Step 5] ZIP contains ${zipFileNames.length} file(s)`);
          
          // Log a few files from the ZIP for debugging
          const sampleFiles = zipFileNames.slice(0, 5);
          sampleFiles.forEach(name => console.log(`[Drive]   - ${name}`));
          if (zipFileNames.length > 5) {
            console.log(`[Drive]   ... and ${zipFileNames.length - 5} more`);
          }

          // Check if this ZIP contains watch history
          const targetFile = zip.file(TARGET_FILE_PATH);
          
          if (targetFile) {
            console.log('[Drive Step 6] FOUND watch-history.json in:', file.name);
            
            // Extract and parse the data
            const fileContent = await targetFile.async("string");
            console.log('[Drive Step 6] File content length:', fileContent.length, 'chars');
            
            const parsedData = JSON.parse(fileContent);
            const entryCount = Array.isArray(parsedData) ? parsedData.length : 'N/A (not array)';
            console.log('[Drive Step 6] Parsed data, entries:', entryCount);
            console.log('[Drive] SUCCESS: fetchAndExtractZip complete');
            console.log('----------------------------------------\n');

            return parsedData;
          } else {
            console.log('[Drive Step 5] watch-history.json NOT in this part, checking next...');
            
            // Check if there's any YouTube-related content
            const ytContent = zipFileNames.filter(n => n.toLowerCase().includes('youtube'));
            if (ytContent.length > 0) {
              console.log('[Drive] YouTube content found but no watch-history:');
              ytContent.slice(0, 5).forEach(f => console.log(`[Drive]   - ${f}`));
            }
          }
        } catch (downloadError: any) {
          console.log(`[Drive Step 4] Error downloading ${file.name}:`, downloadError.message);
          // Continue to next file
        }
      }
    }
    
    // If we get here, we searched all files and didn't find watch history
    console.log('[Drive] FAILED: watch-history.json not found in any Takeout ZIP');
    throw new Error(
      "Watch history file not found in any Takeout ZIP. " +
      "Make sure you selected 'history' under 'YouTube and YouTube Music' data options when creating the export."
    );

  } catch (error: any) {
    console.error('\n[Drive] FAILED: fetchAndExtractZip error');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    if (error?.response?.status) {
      console.error('HTTP Status:', error.response.status);
      console.error('HTTP Data:', error.response.data);
    }
    console.error('----------------------------------------\n');
    throw error;
  }
}