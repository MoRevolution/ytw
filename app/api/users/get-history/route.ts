import { getAdminDB } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { decryptToken } from '@/lib/encryption';
import { fetchAndExtractZip } from '@/lib/google-drive-backend';

export async function GET(request: Request) {
  try {
    console.log('🔔 Starting watch history fetch process');
    
    // Initialize Firebase Admin first
    const adminDb = getAdminDB();
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    console.log('📝 Fetching watch history for user:', uid);

    // Get the user's document from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      console.log('❌ User document not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const encryptedToken = userData?.accessToken;

    if (!encryptedToken) {
      console.log('❌ No access token found for user');
      return NextResponse.json({ error: 'No access token found' }, { status: 404 });
    }

    // Decrypt the token
    const accessToken = await decryptToken(encryptedToken);

    // Use the token to fetch watch history data
    const watchHistoryData = await fetchAndExtractZip(accessToken);

    // Update the user's last data update timestamp
    await adminDb.collection('users').doc(uid).update({
      lastDataUpdate: new Date(),
    });

    console.log('✅ Successfully retrieved and processed watch history data');
    return NextResponse.json({ data: watchHistoryData });
  } catch (error) {
    console.error('❌ Error fetching watch history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch watch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 