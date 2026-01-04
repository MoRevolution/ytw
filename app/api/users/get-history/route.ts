import { getAdminDB } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { decryptToken } from '@/lib/encryption';
import { fetchAndExtractZip } from '@/lib/google-drive-backend';

export async function GET(request: Request) {
  try {
    console.log('\n========== GET /api/users/get-history ==========');
    console.log('[Step 1] Starting watch history fetch process');
    
    // Initialize Firebase Admin first
    console.log('[Step 2] Initializing Firebase Admin...');
    const adminDb = getAdminDB();
    console.log('[Step 2] Firebase Admin initialized successfully');
    
    // Get the authorization header
    console.log('[Step 3] Checking authorization header...');
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[Step 3] FAILED: No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('[Step 3] Authorization header present');

    const idToken = authHeader.split('Bearer ')[1];
    console.log('[Step 4] Verifying ID token (length:', idToken?.length, ')');
    
    // Verify the ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log('[Step 4] Token verified, uid:', uid);

    // Get the user's document from Firestore
    console.log('[Step 5] Fetching user document from Firestore...');
    const userDoc = await adminDb.collection('users').doc(uid).get();
    console.log('[Step 5] User document fetched, exists:', userDoc.exists);

    if (!userDoc.exists) {
      console.log('[Step 5] FAILED: User document not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const encryptedToken = userData?.accessToken;
    console.log('[Step 6] Checking encrypted token, present:', !!encryptedToken, ', length:', encryptedToken?.length);

    if (!encryptedToken) {
      console.log('[Step 6] FAILED: No access token found for user');
      return NextResponse.json({ error: 'No access token found' }, { status: 404 });
    }
    console.log('[Step 6] Encrypted token found');

    // Decrypt the token
    console.log('[Step 7] Decrypting access token...');
    const accessToken = await decryptToken(encryptedToken);
    console.log('[Step 7] Token decrypted successfully, length:', accessToken?.length);

    // Use the token to fetch watch history data
    console.log('[Step 8] Fetching watch history from Google Drive...');
    const watchHistoryData = await fetchAndExtractZip(accessToken);
    const dataInfo = Array.isArray(watchHistoryData) 
      ? `array with ${watchHistoryData.length} entries`
      : `object with keys: ${Object.keys(watchHistoryData || {}).slice(0, 5).join(', ')}`;
    console.log('[Step 8] Watch history fetched:', dataInfo);

    // Update the user's last data update timestamp
    console.log('[Step 9] Updating lastDataUpdate timestamp...');
    await adminDb.collection('users').doc(uid).update({
      lastDataUpdate: new Date(),
    });
    console.log('[Step 9] Timestamp updated');

    console.log('[SUCCESS] Watch history fetch complete');
    console.log('=================================================\n');
    return NextResponse.json({ data: watchHistoryData });
  } catch (error) {
    console.error('\n[ERROR] /api/users/get-history failed');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=================================================\n');
    
    // Return more specific error info for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Categorize errors for better client-side handling
    if (errorMessage.includes('No Takeout zip files found')) {
      return NextResponse.json({ 
        error: 'NO_TAKEOUT_FOLDER',
        message: 'No Google Takeout export found in your Drive. Please create one first.',
        details: errorMessage
      }, { status: 404 });
    }
    
    if (errorMessage.includes('decrypt') || errorMessage.includes('Unsupported state')) {
      return NextResponse.json({ 
        error: 'TOKEN_ERROR',
        message: 'Session expired. Please log out and log in again.',
        details: errorMessage
      }, { status: 401 });
    }
    
    if (errorMessage.includes('Watch history file not found')) {
      return NextResponse.json({ 
        error: 'INVALID_TAKEOUT',
        message: 'Your Takeout export does not contain YouTube watch history. Please export with history included.',
        details: errorMessage
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'FETCH_FAILED',
      message: 'Failed to fetch watch history',
      details: errorMessage
    }, { status: 500 });
  }
} 