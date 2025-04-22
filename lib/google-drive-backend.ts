import { google } from "googleapis";
import JSZip from "jszip";
import fetch from "node-fetch"; 
import path from "path";

// Initialize Google Drive API client
const drive = google.drive("v3");

/**
 * Fetches the latest zip file from the Takeout folder in Google Drive, extracts the `watch-history.json` file,
 * and returns its contents.
 * @param {string} accessToken - The Google OAuth access token.
 * @returns {Promise<object>} - The parsed contents of `watch-history.json`.
 */
export async function fetchAndExtractZip(accessToken: string): Promise<object> {
  try {
    // Set up and authenticate
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });

    // Search for Takeout files
    const fileList = await drive.files.list({
      auth: authClient,
      q: "name contains 'takeout' and mimeType='application/x-zip'",
      orderBy: 'createdTime desc',
      pageSize: 1,
      fields: 'files(id, name, mimeType, createdTime)',
    });

    const files = fileList.data.files;
    if (!files?.length) {
      console.log("❌ No Takeout files found");
      throw new Error("No Takeout zip files found in Google Drive");
    }

    const latestFile = files[0];
    console.log("📁 Found Takeout file:", latestFile.name);

    // Download the zip file
    const response = await drive.files.get({
      auth: authClient,
      fileId: latestFile.id,
      alt: "media",
    }, { responseType: "arraybuffer" });

    if (!response.data) {
      throw new Error("No data received from file download");
    }

    // Process the zip file
    const zipBuffer = Buffer.from(response.data as ArrayBuffer);
    const zip = await JSZip.loadAsync(zipBuffer);
    
    // Log available files to help with debugging
    console.log("📑 Files in zip:", Object.keys(zip.files).length);

    // Try to find the watch history file
    const possiblePaths = [
      path.join("Takeout", "YouTube and YouTube Music", "history", "watch-history.json"),
      "Takeout/YouTube and YouTube Music/history/watch-history.json",
      "YouTube and YouTube Music/history/watch-history.json",
      "history/watch-history.json",
      "watch-history.json"
    ];

    let targetFile = null;
    for (const tryPath of possiblePaths) {
      targetFile = zip.file(tryPath);
      if (targetFile) {
        console.log("✅ Found watch history at:", tryPath);
        break;
      }
    }

    if (!targetFile) {
      console.log("❌ Watch history not found in paths:", possiblePaths);
      throw new Error("Watch history file not found in zip");
    }

    // Extract and parse the data
    const fileContent = await targetFile.async("string");
    const parsedData = JSON.parse(fileContent);
    console.log("✅ Successfully extracted watch history data");

    return parsedData;
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}