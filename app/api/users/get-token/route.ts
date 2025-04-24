import { getAdminDB } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: Request) {
  try {
    console.log('🔔 Starting token fetch process');
    
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
    
    console.log('📝 Fetching token for user:', uid);

    // Get the user's document from Firestore
    const adminDb = getAdminDB();
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      console.log('❌ User document not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const accessToken = userData?.accessToken;

    if (!accessToken) {
      console.log('❌ No access token found for user');
      return NextResponse.json({ error: 'No access token found' }, { status: 404 });
    }

    console.log('✅ Successfully retrieved access token');
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('❌ Error fetching access token:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch access token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 